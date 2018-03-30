package com.elmakers.mine.bukkit.meta;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

public class MetaData {
    private ParameterList mobParameters = new ParameterList();
    private ParameterList actionParameters = new ParameterList();
    private ParameterList spellParameters = new ParameterList();
    private ParameterList spellProperties = new ParameterList();
    private Map<String, Category> categories = new HashMap<>();
    private Map<String, SpellActionDescription> actions = new HashMap<>();
    private ParameterList effectParameters = new ParameterList();
    private ParameterList effectLibParameters = new ParameterList();
    private Map<String, EffectDescription> effects = new HashMap<>();
    private ParameterList wandParameters = new ParameterList();
    private ParameterStore parameterStore = new ParameterStore();

    @JsonProperty("spell_parameters")
    public ParameterList getSpellParameters() {
        return spellParameters;
    }

    public void setSpellParameters(ParameterList spellParameters) {
        this.spellParameters = spellParameters;
    }

    @JsonProperty("mob_properties")
    public ParameterList getMobParameters() {
        return mobParameters;
    }

    public void setMobParameters(ParameterList mobParameters) {
        this.mobParameters = mobParameters;
    }

    @JsonProperty("action_parameters")
    public ParameterList getActionParameters() {
        return actionParameters;
    }

    public void setActionParameters(ParameterList actionParameters) {
        this.actionParameters = actionParameters;
    }

    @JsonProperty("spell_properties")
    public ParameterList getSpellProperties() {
        return spellProperties;
    }

    public void setSpellProperties(ParameterList spellProperties) {
        this.spellProperties = spellProperties;
    }

    @JsonProperty("categories")
    public Map<String, Category> getCategories() {
        return categories;
    }

    public void setCategories(Map<String, Category> categories) {
        this.categories = categories;
    }

    @JsonProperty("properties")
    public Map<String, Parameter> getParameters() {
        return parameterStore.getParameters();
    }

    public void setParameters(Map<String, Parameter> allParameters) {
        this.parameterStore.setParameters(allParameters);
    }

    @JsonProperty("actions")
    public Map<String, SpellActionDescription> getActions() {
        return actions;
    }

    public void setActions(Map<String, SpellActionDescription> actions) {
        this.actions = actions;
    }

    @JsonProperty("effect_parameters")
    public ParameterList getEffectParameters() {
        return effectParameters;
    }

    public void setEffectParameters(ParameterList effectParameters) {
        this.effectParameters = effectParameters;
    }

    @JsonProperty("effectlib_parameters")
    public ParameterList getEffectLibParameters() {
        return effectLibParameters;
    }

    public void setEffectLibParameters(ParameterList effectLibParameters) {
        this.effectLibParameters = effectLibParameters;
    }

    @JsonProperty("effectlib_effects")
    public Map<String, EffectDescription> getEffects() {
        return effects;
    }

    public void setEffects(Map<String, EffectDescription> effects) {
        this.effects = effects;
    }

    @JsonProperty("wand_properties")
    public ParameterList getWandParameters() {
        return wandParameters;
    }

    public void setWandParameters(ParameterList wandParameters) {
        this.wandParameters = wandParameters;
    }

    @JsonProperty("types")
    public Map<String, ParameterType> getTypes() {
        return parameterStore.getTypes();
    }

    public void setTypes(Map<String, ParameterType> types) {
        parameterStore.setTypes(types);
    }

    @JsonIgnore
    public ParameterStore getParameterStore() {
        return parameterStore;
    }

    public Category getCategory(String key) {
        Category category = categories.get(key);
        if (category == null) {
            category = new Category(key);
            categories.put(key, category);
        }
        return category;
    }

    public void addWandParameters(ParameterList parameters) {
        wandParameters.merge(parameters, parameterStore);
    }

    public void addEffectLibParameters(ParameterList parameters) {
        effectLibParameters.merge(parameters, parameterStore);
    }

    public void addEffectParameters(ParameterList parameters) {
        effectParameters.merge(parameters, parameterStore);
    }

    public void addMobParameters(ParameterList parameters) {
        mobParameters.merge(parameters, parameterStore);
    }

    public void addActionParameters(ParameterList parameters) {
        actionParameters.merge(parameters, parameterStore);
    }

    public void addSpellParameters(ParameterList parameters) {
        spellParameters.merge(parameters, parameterStore);
    }

    public void addSpellProperties(ParameterList parameters) {
        spellProperties.merge(parameters, parameterStore);
    }

    public Parameter getParameter(String key, Class<?> defaultClass) {
        return parameterStore.getParameter(key, defaultClass);
    }

    public void addEffect(String key, EffectDescription effect) {
        EffectDescription existing = effects.get(key);
        if (existing != null) {
            existing.merge(effect, parameterStore);
        } else {
            effects.put(key, effect);
        }
    }

    public void addAction(String key, SpellActionDescription action) {
        // Merge with existing actions
        SpellActionDescription existing = actions.get(key);
        if (existing != null) {
            existing.merge(action, parameterStore);
        } else {
            actions.put(key, action);
        }
    }

    public void update() {
        parameterStore.update();
    }

    public void loaded() {
        parameterStore.loaded();
        for (Map.Entry<String, Category> entry : categories.entrySet()) {
            entry.getValue().setKey(entry.getKey());
        }
        for (Map.Entry<String, SpellActionDescription> entry : actions.entrySet()) {
            entry.getValue().setKey(entry.getKey());
        }
        for (Map.Entry<String, EffectDescription> entry : effects.entrySet()) {
            entry.getValue().setKey(entry.getKey());
        }
    }
}
