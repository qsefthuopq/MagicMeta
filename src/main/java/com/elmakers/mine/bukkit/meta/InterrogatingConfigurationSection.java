package com.elmakers.mine.bukkit.meta;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import javax.annotation.Nonnull;

import org.bukkit.configuration.ConfigurationSection;
import org.bukkit.configuration.MemoryConfiguration;
import org.bukkit.configuration.MemorySection;

public class InterrogatingConfigurationSection extends MemorySection {
    private ParameterList parameters = new ParameterList();
    private final ParameterStore parameterStore;

    public InterrogatingConfigurationSection(@Nonnull ParameterStore parameterStore) {
        super();
        this.parameterStore = parameterStore;
    }

    @Override
    public int getInt(String path, int def) {
        parameters.add(parameterStore.getParameter(path, Integer.class), def);
        return super.getInt(path, def);
    }

    @Override
    public double getDouble(String path, double def) {
        parameters.add(parameterStore.getParameter(path, Double.class), def);
        return super.getDouble(path, def);
    }

    @Override
    public long getLong(String path, long def) {
        parameters.add(parameterStore.getParameter(path, Long.class), def);
        return super.getLong(path, def);
    }

    @Override
    public ConfigurationSection getConfigurationSection(String path) {
        parameters.add(parameterStore.getParameter(path, Map.class), null);
        ConfigurationSection section = super.getConfigurationSection(path);

        // Don't return null since we're lying with contains()
        return section == null ? new MemoryConfiguration() : section;
    }

    @Override
    public String getString(String path, String def) {
        parameters.add(parameterStore.getParameter(path, String.class), def);
        String value = super.getString(path, def);
        return value == null ? "" : value;
    }

    @Override
    public List<?> getList(String path) {
        parameters.add(parameterStore.getParameter(path, List.class), null);
        List<?> list = super.getList(path);
        return list == null ? new ArrayList<String>() : list;
    }

    @Override
    public Object get(String path, Object def) {
        parameters.add(parameterStore.getParameter(path, String.class), def);
        return super.get(path, def);
    }

    @Override
    public boolean getBoolean(String path, boolean def) {
        parameters.add(parameterStore.getParameter(path, Boolean.class), def);
        return super.getBoolean(path, def);
    }

    /**
     * Explore branches we'd otherwise ignore...
     */
    @Override
    public boolean contains(String path) {
        return true;
    }

    @Nonnull
    public ParameterList getParameters() {
        return parameters;
    }
}
