package com.elmakers.mine.bukkit.meta;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.annotation.Nonnull;

import org.apache.commons.lang.WordUtils;
import com.fasterxml.jackson.annotation.JsonIgnore;

public class ParameterType {
    private Class<?> classType;
    private String key;
    private String name;
    private String className;
    private List<String> description;
    private Set<String> options = new HashSet<>();
    private ParameterType valueType;
    private ParameterType keyType;

    public ParameterType(@Nonnull String key, @Nonnull Class<?> classType) {
        this.key = key;
        this.classType = classType;
        className = classType.getName();
        description = new ArrayList<>();
        description.add("");
        name = WordUtils.capitalizeFully(key, new char[]{'_'}).replaceAll("_", " ");
    }

    public ParameterType(@Nonnull String key, ParameterType listValueType) {
        this(key, List.class);
        valueType = listValueType;
    }

    public ParameterType(@Nonnull String key, ParameterType mapKeyType, ParameterType mapValueType) {
        this(key,  Map.class);
        keyType = mapKeyType;
        valueType = mapValueType;
    }

    @JsonIgnore
    public String getKey() {
        return this.key;
    }

    public String getClassName() {
        return this.className;
    }

    public void update() {
        if (classType.isEnum()) {
            Object[] enums = classType.getEnumConstants();
            for (Object enumConstant : enums) {
                options.add(enumConstant.toString().toLowerCase());
            }
        }
    }

    public List<String> getOptions() {
        List<String> optionsList = new ArrayList<>(options);
        Collections.sort(optionsList);
        return optionsList;
    }

    public List<String> getDescription() {
        return description;
    }

    public String getName() {
        return name;
    }

    public String getValueType() {
        return valueType == null ? null : valueType.getKey();
    }

    public String getKeyType() {
        return keyType == null ? null : keyType.getKey();
    }
}
