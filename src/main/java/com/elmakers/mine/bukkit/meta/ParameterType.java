package com.elmakers.mine.bukkit.meta;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javax.annotation.Nonnull;

import org.apache.commons.lang.WordUtils;
import com.fasterxml.jackson.annotation.JsonIgnore;

public class ParameterType {
    private Class<?> classType;
    private String key;
    private String name;
    private String description;
    private String className;
    private Set<String> options = new HashSet<>();

    public ParameterType(@Nonnull String key, @Nonnull Class<?> classType) {
        this.key = key;
        this.classType = classType;
        className = classType.getName();
        description = "";
        name = WordUtils.capitalizeFully(key, new char[]{'_'}).replaceAll("_", " ");
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

    public String getDescription() {
        return description;
    }

    public String getName() {
        return name;
    }
}
