package com.elmakers.mine.bukkit.meta;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Nonnull;

import com.google.common.base.CaseFormat;

public class ParameterTypeStore {
    private final Map<String, ParameterType> typeMap = new HashMap<>();

    public ParameterType getParameterType(@Nonnull Class<?> classType) {
        String key = CaseFormat.LOWER_CAMEL.to(CaseFormat.LOWER_UNDERSCORE, classType.getSimpleName());
        return getParameterType(key, classType);
    }

    public ParameterType getParameterType(@Nonnull String key, @Nonnull Class<?> classType) {
        ParameterType parameterType = typeMap.get(key);
        if (parameterType == null) {
            parameterType = new ParameterType(key, classType);
            typeMap.put(key, parameterType);
        }

        return parameterType;
    }

    public Map<String, ParameterType> getTypes() {
        return typeMap;
    }

    public void update() {
        for (ParameterType parameterType : typeMap.values()) {
            parameterType.update();
        }
    }
}
