package com.elmakers.mine.bukkit.meta;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

public class MetaData {
    private Set<String> mobParameters = new HashSet<>();
    private Set<String> actionParameters = new HashSet<>();
    private Set<String> spellParameters = new HashSet<>();
    private Set<String> spellProperties = new HashSet<>();
    private Map<String, Category> categories = new HashMap<>();
    private Map<String, SpellActionDescription> actions = new HashMap<>();
    private Set<String> effectParameters = new HashSet<>();
    private Set<String> effectLibParameters = new HashSet<>();
    private Map<String, EffectDescription> effects = new HashMap<>();
    private Set<String> wandParameters = new HashSet<>();
    private ParameterStore parameterStore = new ParameterStore();

    @JsonProperty("spell_parameters")
    public List<String> getSpellParameters() {
        return sortCollection(spellParameters);
    }

    public void setSpellParameters(Set<String> spellParameters) {
        this.spellParameters = spellParameters;
    }

    @JsonProperty("mob_properties")
    public List<String> getMobParameters() {
        return sortCollection(mobParameters);
    }

    public void setMobParameters(Set<String> mobParameters) {
        this.spellParameters = mobParameters;
    }

    @JsonProperty("action_parameters")
    public List<String> getActiongetActionParaParameters() {
        return sortCollection(actionParameters);
    }

    public void setActionParameters(Set<String> actionParameters) {
        this.actionParameters = actionParameters;
    }

    @JsonProperty("spell_properties")
    public List<String> getSpellProperties() {
        return sortCollection(spellProperties);
    }

    public void setSpellProperties(Set<String> spellProperties) {
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
    public List<String> getEffectParameters() {
        return sortCollection(effectParameters);
    }

    public void setEffectParameters(Set<String> effectParameters) {
        this.effectParameters = effectParameters;
    }

    @JsonProperty("effectlib_parameters")
    public List<String> getEffectLibParameters() {
        return sortCollection(effectLibParameters);
    }

    public void setEffectLibParameters(Set<String> effectLibParameters) {
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
    public List<String> getWandParameters() {
        return sortCollection(wandParameters);
    }

    public void setWandParameters(Set<String> wandParameters) {
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

    public void setParameterStore(ParameterStore parameterStore) {
        this.parameterStore = parameterStore;
    }

    private List<String> sortCollection(Collection<String> unsorted) {
        List<String> sorted = new ArrayList<>(unsorted);
        Collections.sort(sorted);
        return sorted;
    }

    public Category getCategory(String key) {
        Category category = categories.get(key);
        if (category == null) {
            category = new Category(key);
            categories.put(key, category);
        }
        return category;
    }

    public void addWandParameter(String key) {
        wandParameters.add(key);
    }

    public void addParameter(String key, Parameter parameter) {
        parameterStore.addParameter(key, parameter);
    }

    public void addEffectLibParameter(String key) {
        effectLibParameters.add(key);
    }

    public void addEffectParameter(String key) {
        effectParameters.add(key);
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

    public void addMobParameter(String key) {
        mobParameters.add(key);
    }

    public void addActionParameter(String key) {
        actionParameters.add(key);
    }

    public void addSpellParameter(String key) {
        spellParameters.add(key);
    }

    public void addSpellProperty(String key) {
        spellProperties.add(key);
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
