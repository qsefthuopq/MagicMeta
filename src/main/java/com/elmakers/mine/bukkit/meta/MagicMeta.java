package com.elmakers.mine.bukkit.meta;

import java.io.File;
import java.io.IOException;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import javax.annotation.Nonnull;

import org.reflections.Reflections;
import com.elmakers.mine.bukkit.action.CastContext;
import com.elmakers.mine.bukkit.api.action.SpellAction;
import com.elmakers.mine.bukkit.magic.Mage;
import com.elmakers.mine.bukkit.magic.MagicController;
import com.elmakers.mine.bukkit.spell.ActionSpell;

public class MagicMeta {
    private static final String BUILTIN_SPELL_PACKAGE = "com.elmakers.mine.bukkit.action.builtin";

    private final Map<String, Parameter> allParameters = new HashMap<>();
    private final Map<String, SpellActionDescription> actions = new HashMap<>();
    private final ParameterTypeStore parameterTypeStore = new ParameterTypeStore();
    private final SortedObjectMapper mapper = new SortedObjectMapper();

    public static void main(String[] args) {
        if (args.length == 0) {
            System.out.println("Usage: MagicMeta <meta.json>");
            return;
        }

        String fileName = args[0];
        MagicMeta meta = new MagicMeta();
        try {
            File metaFile = new File(fileName);
            System.out.println("Writing metadata to " + metaFile.getAbsolutePath());
            meta.loadMeta(metaFile);
            meta.generateMeta();
            meta.saveMeta(metaFile);
        } catch (Exception ex) {
            System.out.println("An error ocurred generating metadata " + ex.getMessage());
            ex.printStackTrace();
        }
        System.out.println("Done.");
    }

    private void loadMeta(@Nonnull File inputFile) {
        // TODO!
    }

    private void saveMeta(@Nonnull File outputFile) throws IOException {
        parameterTypeStore.update();

        Map<String, Object> root = new HashMap<>();
        root.put("actions", actions);
        root.put("parameters", allParameters);
        root.put("types", parameterTypeStore.getTypes());

        mapper.writerWithDefaultPrettyPrinter().writeValue(outputFile, root);
    }

    private void generateMeta() {
        // Note that this seems to get everything outside of this package as well. Not sure why.
        Reflections reflections = new Reflections(BUILTIN_SPELL_PACKAGE);

        Set<Class<? extends SpellAction>> allClasses = reflections.getSubTypesOf(SpellAction.class);

        // This will can for base spell properties, as well as parameters loaded at init time
        InterrogatingConfiguration templateConfiguration = new InterrogatingConfiguration(parameterTypeStore);

        MagicController controller = new MagicController();
        Mage mage = new Mage("Interrogator", controller);
        ActionSpell spell = new ActionSpell();
        spell.initialize(controller);
        spell.setMage(mage);
        spell.loadTemplate("interrogator", templateConfiguration);
        CastContext context = new CastContext(mage);
        context.setSpell(spell);

        for (Class<? extends SpellAction> actionClass : allClasses) {
            if (!actionClass.getPackage().getName().equals(BUILTIN_SPELL_PACKAGE) || actionClass.getAnnotation(Deprecated.class) != null) {
                System.out.println("Skipping " + actionClass.getName());
                continue;
            }
            System.out.println("Scanning " + actionClass.getName());
            try {
                SpellAction testAction = actionClass.getConstructor().newInstance();
                InterrogatingConfiguration testConfiguration = new InterrogatingConfiguration(parameterTypeStore);
                testAction.initialize(spell, testConfiguration);
                testAction.prepare(context, testConfiguration);

                // TODO: Track spells with exceptional parameter types
                Collection<Parameter> spellParameters = testConfiguration.getParameters();
                for (Parameter parameter : spellParameters) {
                    allParameters.put(parameter.getKey(), parameter);
                }

                SpellActionDescription spellAction = new SpellActionDescription(actionClass, spellParameters);
                actions.put(spellAction.getKey(), spellAction);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
