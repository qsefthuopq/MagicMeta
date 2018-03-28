package com.elmakers.mine.bukkit.meta;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.annotation.Nonnull;

import org.reflections.Reflections;
import com.elmakers.mine.bukkit.action.CastContext;
import com.elmakers.mine.bukkit.api.action.SpellAction;
import com.elmakers.mine.bukkit.effect.EffectPlayer;
import com.elmakers.mine.bukkit.effect.builtin.EffectSingle;
import com.elmakers.mine.bukkit.magic.Mage;
import com.elmakers.mine.bukkit.magic.MagicController;
import com.elmakers.mine.bukkit.spell.ActionSpell;
import com.elmakers.mine.bukkit.spell.BaseSpell;
import com.elmakers.mine.bukkit.spell.BlockSpell;
import com.elmakers.mine.bukkit.spell.BrushSpell;
import com.elmakers.mine.bukkit.spell.TargetingSpell;
import com.elmakers.mine.bukkit.spell.UndoableSpell;

public class MagicMeta {
    private static final String BUILTIN_SPELL_PACKAGE = "com.elmakers.mine.bukkit.action.builtin";

    private final Set<String> spellParameters = new HashSet<>();
    private final Set<String> effectParameters = new HashSet<>();
    private final Set<String> spellProperties = new HashSet<>();
    private final Map<String, Category> categories = new HashMap<>();
    private final Map<String, Parameter> allParameters = new HashMap<>();
    private final Map<String, SpellActionDescription> actions = new HashMap<>();
    private final ParameterTypeStore parameterTypeStore = new ParameterTypeStore();
    private final SortedObjectMapper mapper = new SortedObjectMapper();

    private final MagicController controller;
    private final Mage mage;

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

    private MagicMeta() {
        controller = new MagicController();
        mage = new Mage("Interrogator", controller);
    }

    private void loadMeta(@Nonnull File inputFile) {
        // TODO!
    }

    private void saveMeta(@Nonnull File outputFile) throws IOException {
        parameterTypeStore.update();

        Map<String, Object> root = new HashMap<>();
        root.put("actions", actions);
        root.put("categories", categories);
        root.put("effect_parameters", sortCollection(effectParameters));
        root.put("spell_parameters", sortCollection(spellParameters));
        root.put("spell_properties", sortCollection(spellProperties));
        root.put("parameters", allParameters);
        root.put("types", parameterTypeStore.getTypes());

        mapper.writerWithDefaultPrettyPrinter().writeValue(outputFile, root);
    }

    private List<String> sortCollection(Collection<String> unsorted) {
        List<String> sorted = new ArrayList<>(unsorted);
        Collections.sort(sorted);
        return sorted;
    }

    private void addSpellParameters(MagicController controller, Mage mage, BaseSpell spell, Set<Parameter> parameters, Set<Parameter> properties, String categoryKey) {
        Category category = getCategory(categoryKey);
        InterrogatingConfiguration templateConfiguration = new InterrogatingConfiguration(parameterTypeStore);

        spell.initialize(controller);
        spell.setMage(mage);

        // Gather base properties
        spell.loadTemplate("interrogator", templateConfiguration);
        for (Parameter parameter : templateConfiguration.getParameters()) {
            parameter.setCategory(category);
            properties.add(parameter);
        }

        // Gather parameters
        InterrogatingConfiguration spellConfiguration = new InterrogatingConfiguration(parameterTypeStore);
        spell.processParameters(spellConfiguration);
        for (Parameter parameter : spellConfiguration.getParameters()) {
            parameter.setCategory(category);
            parameters.add(parameter);
        }
    }

    private void generateSpellMeta() {
        Set<Parameter> parameters = new HashSet<>();
        Set<Parameter> properties = new HashSet<>();

        // Check for base spell parameters
        // Do this one class at a time for categorization purposes
        addSpellParameters(controller, mage, new BaseSpell(), parameters, properties, "base");
        addSpellParameters(controller, mage, new TargetingSpell(), parameters, properties, "targeting");
        addSpellParameters(controller, mage, new UndoableSpell(), parameters, properties, "undo");
        addSpellParameters(controller, mage, new BlockSpell(), parameters, properties, "construction");
        addSpellParameters(controller, mage, new BrushSpell(), parameters, properties, "brushes");
        addSpellParameters(controller, mage, new ActionSpell(), parameters, properties, "actions");

        // Gather base spell properties loaded from loadTemplate
        for (Parameter spellProperty : properties) {
            if (spellProperty.getKey().equals("parameters") || spellProperty.getKey().equals("costs")
                 || spellProperty.getKey().equals("actions") || spellProperty.getKey().equals("active_costs")) continue;

            spellProperties.add(spellProperty.getKey());
            allParameters.put(spellProperty.getKey(), spellProperty);
        }

        // Add base spell parameters
        for (Parameter spellParameter : parameters) {
            spellParameters.add(spellParameter.getKey());
            allParameters.put(spellParameter.getKey(), spellParameter);
        }
    }

    private void generateActionMeta() {
        // Note that this seems to get everything outside of this package as well. Not sure why.
        Reflections reflections = new Reflections(BUILTIN_SPELL_PACKAGE);

        Set<Class<? extends SpellAction>> allClasses = reflections.getSubTypesOf(SpellAction.class);

        InterrogatingConfiguration templateConfiguration = new InterrogatingConfiguration(parameterTypeStore);
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
                InterrogatingConfiguration actionConfiguration = new InterrogatingConfiguration(parameterTypeStore);
                testAction.initialize(spell, actionConfiguration);
                testAction.prepare(context, actionConfiguration);

                // TODO: Track spells with exceptional parameter types
                Collection<Parameter> spellParameters = actionConfiguration.getParameters();
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

    private void generateEffectsMeta() {
        System.out.println("Scanning EffectSingle");
        InterrogatingConfiguration effectConfiguration = new InterrogatingConfiguration(parameterTypeStore);
        EffectPlayer player = new EffectSingle();
        player.load(null, effectConfiguration);
        Collection<Parameter> singleParameters = effectConfiguration.getParameters();
        for (Parameter parameter : singleParameters) {
            allParameters.put(parameter.getKey(), parameter);
            effectParameters.add(parameter.getKey());
        }
    }

    private void generateMeta() {
        generateSpellMeta();
        generateActionMeta();
        generateEffectsMeta();
    }

    private Category getCategory(String key) {
        Category category = categories.get(key);
        if (category == null) {
            category = new Category(key);
            categories.put(key, category);
        }
        return category;
    }
}
