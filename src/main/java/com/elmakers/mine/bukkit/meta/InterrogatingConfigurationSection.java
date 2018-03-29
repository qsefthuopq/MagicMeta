package com.elmakers.mine.bukkit.meta;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import javax.annotation.Nonnull;

import org.bukkit.configuration.ConfigurationSection;
import org.bukkit.configuration.MemorySection;

public class InterrogatingConfigurationSection extends MemorySection {
    private Set<Parameter> parameters = new HashSet<>();
    private final ParameterStore parameterStore;

    public InterrogatingConfigurationSection(@Nonnull ParameterStore parameterStore) {
        super();
        this.parameterStore = parameterStore;
    }

    @Override
    public int getInt(String path, int def) {
        parameters.add(parameterStore.getParameter(path, Integer.class));
        return super.getInt(path, def);
    }

    @Override
    public double getDouble(String path, double def) {
        parameters.add(parameterStore.getParameter(path, Double.class));
        return super.getDouble(path, def);
    }

    @Override
    public long getLong(String path, long def) {
        parameters.add(parameterStore.getParameter(path, Long.class));
        return super.getLong(path, def);
    }

    @Override
    public ConfigurationSection getConfigurationSection(String path) {
        parameters.add(parameterStore.getParameter(path, Map.class));
        return super.getConfigurationSection(path);
    }

    @Override
    public String getString(String path, String def) {
        parameters.add(parameterStore.getParameter(path, String.class));
        return super.getString(path, def);
    }

    @Override
    public boolean getBoolean(String path, boolean def) {
        parameters.add(parameterStore.getParameter(path, Boolean.class));
        return super.getBoolean(path, def);
    }

    /*

    I was hoping this would catch cases like PotionEffectAction's list of effect_ parameters,
    but for some reason it does not.

    I was then worried it would cause parameters to show up incorrectly as Strings, so basically
    just avoiding this for now.

    @Override
    public boolean contains(String path) {
        parameters.add(parameterStore.getParameter(path, String.class));
        return super.contains(path);
    }
    */

    @Nonnull
    public Set<Parameter> getParameters() {
        return parameters;
    }
}
