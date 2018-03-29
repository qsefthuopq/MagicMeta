package com.elmakers.mine.bukkit.meta;

import java.io.File;
import java.io.IOException;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import javax.annotation.Nonnull;

import org.bukkit.entity.Player;
import org.reflections.Reflections;
import com.elmakers.mine.bukkit.action.CastContext;
import com.elmakers.mine.bukkit.api.action.SpellAction;
import com.elmakers.mine.bukkit.effect.EffectPlayer;
import com.elmakers.mine.bukkit.effect.builtin.EffectSingle;
import com.elmakers.mine.bukkit.magic.BaseMagicProperties;
import com.elmakers.mine.bukkit.magic.Mage;
import com.elmakers.mine.bukkit.magic.MagicController;
import com.elmakers.mine.bukkit.spell.ActionSpell;
import com.elmakers.mine.bukkit.spell.BaseSpell;
import com.elmakers.mine.bukkit.spell.BlockSpell;
import com.elmakers.mine.bukkit.spell.BrushSpell;
import com.elmakers.mine.bukkit.spell.TargetingSpell;
import com.elmakers.mine.bukkit.spell.UndoableSpell;
import com.fasterxml.jackson.databind.JsonNode;
import com.google.common.base.CaseFormat;

import de.slikey.effectlib.Effect;

public class MagicMeta {
    private static final String BUILTIN_SPELL_PACKAGE = "com.elmakers.mine.bukkit.action.builtin";
    private static final String EFFECTLIB_PACKAGE = "de.slikey.effectlib.effect";

    private final SortedObjectMapper mapper = new SortedObjectMapper();

    private final MagicController controller;
    private final Mage mage;

    private MetaData data;

    public static void main(String[] args) {
        if (args.length == 0) {
            System.out.println("Usage: MagicMeta <meta.json>");
            return;
        }

        String fileName = args[0];
        boolean regenerate = (args.length > 1 && args[1].equals("--regenerate"));
        MagicMeta meta = new MagicMeta();
        try {
            File metaFile = new File(fileName);
            if (!regenerate) {
                System.out.println("Loading " + metaFile.getAbsolutePath());
                meta.loadMeta(metaFile);
            } else {
                System.out.println("Regenerating");
            }
            meta.generateMeta();
            System.out.println("Saving to " + metaFile.getAbsolutePath());
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

    private void loadMeta(@Nonnull File inputFile) throws IOException {
        if (inputFile.exists()) {
            JsonNode root = mapper.readTree(inputFile);
            data = mapper.convertValue(root, MetaData.class);
            data.loaded();
        }
    }

    private void saveMeta(@Nonnull File outputFile) throws IOException {
        data.update();
        mapper.writerWithDefaultPrettyPrinter().writeValue(outputFile, data);
    }

    private void addSpellParameters(MagicController controller, Mage mage, BaseSpell spell, Set<Parameter> parameters, Set<Parameter> properties, String categoryKey) {
        Category category = getCategory(categoryKey);
        InterrogatingConfiguration templateConfiguration = new InterrogatingConfiguration(data.getParameterStore());

        spell.initialize(controller);
        spell.setMage(mage);

        // Gather base properties
        spell.loadTemplate("interrogator", templateConfiguration);
        for (Parameter parameter : templateConfiguration.getParameters()) {
            parameter.setCategory(category.getKey());
            properties.add(parameter);
        }

        // Gather parameters
        InterrogatingConfiguration spellConfiguration = new InterrogatingConfiguration(data.getParameterStore());
        spell.processParameters(spellConfiguration);
        for (Parameter parameter : spellConfiguration.getParameters()) {
            parameter.setCategory(category.getKey());
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

            data.addSpellProperty(spellProperty.getKey());
            data.addParameter(spellProperty.getKey(), spellProperty);
        }

        // Add base spell parameters
        for (Parameter spellParameter : parameters) {
            data.addSpellParameter(spellParameter.getKey());
            data.addParameter(spellParameter.getKey(), spellParameter);
        }
    }

    private void generateActionMeta() {
        // Note that this seems to get everything outside of this package as well. Not sure why.
        Reflections reflections = new Reflections(BUILTIN_SPELL_PACKAGE);

        Set<Class<? extends SpellAction>> classSet = reflections.getSubTypesOf(SpellAction.class);
        List<Class<? extends SpellAction>> allClasses = new ArrayList<>(classSet);
        Collections.sort(allClasses, new ClassComparator());

        InterrogatingConfiguration templateConfiguration = new InterrogatingConfiguration(data.getParameterStore());
        ActionSpell spell = new ActionSpell();
        spell.initialize(controller);
        spell.setMage(mage);
        spell.loadTemplate("interrogator", templateConfiguration);

        CastContext context = new CastContext(mage);
        context.setSpell(spell);

        for (Class<? extends SpellAction> actionClass : allClasses) {
            if (!actionClass.getPackage().getName().equals(BUILTIN_SPELL_PACKAGE)
                || actionClass.getAnnotation(Deprecated.class) != null
                || Modifier.isAbstract(actionClass.getModifiers())) {
                System.out.println("Skipping " + actionClass.getName());
                continue;
            }
            System.out.println("Scanning " + actionClass.getName());
            try {
                SpellAction testAction = actionClass.getConstructor().newInstance();
                InterrogatingConfiguration actionConfiguration = new InterrogatingConfiguration(data.getParameterStore());
                testAction.initialize(spell, actionConfiguration);
                testAction.prepare(context, actionConfiguration);

                // TODO: Track spells with exceptional parameter types
                Collection<Parameter> spellParameters = actionConfiguration.getParameters();
                for (Parameter parameter : spellParameters) {
                    data.addParameter(parameter.getKey(), parameter);
                }

                SpellActionDescription spellAction = new SpellActionDescription(actionClass, spellParameters);
                data.addAction(spellAction.getKey(), spellAction);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    private void generateEffectsMeta() {
        System.out.println("Scanning EffectSingle");
        InterrogatingConfiguration effectConfiguration = new InterrogatingConfiguration(data.getParameterStore());
        EffectPlayer player = new EffectSingle();
        player.load(null, effectConfiguration);
        Collection<Parameter> singleParameters = effectConfiguration.getParameters();
        for (Parameter parameter : singleParameters) {
            data.addParameter(parameter.getKey(), parameter);
            data.addEffectParameter(parameter.getKey());
        }
    }

    private Set<Parameter> collectPublicProperties(Class<?> classType) {
        Set<Parameter> properties = new HashSet<>();
        Field[] fields = classType.getFields();
        for (Field field : fields) {
            if (field.getType() == Player.class || field.getType() == Runnable.class) continue;
            String key = CaseFormat.LOWER_CAMEL.to(CaseFormat.LOWER_UNDERSCORE, field.getName());
            Parameter parameter = data.getParameter(key, field.getType());
            properties.add(parameter);
        }
        return properties;
    }

    private void generateEffectLibMeta() {
        // First get all base effect parameters
        System.out.println("Scanning Effect");
        Set<Parameter> baseEffectParameters = collectPublicProperties(Effect.class);
        for (Parameter parameter : baseEffectParameters) {
            data.addParameter(parameter.getKey(), parameter);
            data.addEffectLibParameter(parameter.getKey());
        }

        // Gather all effect classes
        Reflections reflections = new Reflections(EFFECTLIB_PACKAGE);

        Set<Class<? extends Effect>> effectsSet = reflections.getSubTypesOf(Effect.class);
        List<Class<? extends Effect>> allEffects = new ArrayList<>(effectsSet);
        Collections.sort(allEffects, new ClassComparator());

        for (Class<? extends Effect> effectClass : allEffects) {
            if (effectClass.getAnnotation(Deprecated.class) != null
                || Modifier.isAbstract(effectClass.getModifiers())) {
                System.out.println("Skipping " + effectClass.getName());
                continue;
            }
            System.out.println("Scanning " + effectClass.getName());
            try {
                Set<Parameter> effectParameters = collectPublicProperties(effectClass);

                // Filter out common parameters
                effectParameters.removeAll(baseEffectParameters);

                // TODO: Track effects with exceptional parameter types
                for (Parameter parameter : effectParameters) {
                    data.addParameter(parameter.getKey(), parameter);
                }

                EffectDescription effect = new EffectDescription(effectClass, effectParameters);
                data.addEffect(effect.getKey(), effect);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    private void generateWandMeta() {
        System.out.println("Adding wand properties");

        // Turns out there's no real way to scan the Wand class using InterrogatingConfiguration because it doesn't
        // load typed data directly from its configuration.
        // So we will have to fix up all the types by hand, unfortunately.
        // I think the most common case is doubles, so that's what we'll default to.
        for (String property : BaseMagicProperties.PROPERTY_KEYS) {
            Parameter parameter = data.getParameter(property, Double.class);
            data.addParameter(parameter.getKey(), parameter);
            data.addWandParameter(parameter.getKey());
        }
    }

    private void generateMeta() {
        if (data == null) {
            data = new MetaData();
        }
        generateSpellMeta();
        generateActionMeta();
        generateEffectsMeta();
        generateEffectLibMeta();
        generateWandMeta();
    }

    private Category getCategory(String key) {
        return data.getCategory(key);
    }
}
