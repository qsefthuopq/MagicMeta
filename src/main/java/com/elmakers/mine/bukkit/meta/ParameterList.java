package com.elmakers.mine.bukkit.meta;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

public class ParameterList extends HashMap<String, String> {
    public ParameterList() {

    }

    public ParameterList(List<String> list) {
        add(list);
    }

    public void add(Collection<String> list) {
        for (String key : list) {
            this.put(key, null);
        }
    }

    public void add(Parameter parameter, Object defaultValue) {
        put(parameter.getKey(), defaultValue == null ? null : defaultValue.toString().toLowerCase());
    }

    public void merge(ParameterList other, ParameterStore parameterStore) {
        Map<String, Parameter> fields = new HashMap<>();
        for (String key : keySet()) {
            Parameter parameter = parameterStore.getParameter(key);
            if (parameter == null) {
                System.out.println("Missing parameter: " + key);
                continue;
            }
            fields.put(parameter.getField(), parameter);
        }

        for (Map.Entry<String, String> entry : other.entrySet()) {
            String key = entry.getKey();
            Parameter parameter = parameterStore.getParameter(key);
            if (parameter == null) {
                System.out.println("Missing parameter: " + key);
                continue;
            }
            Parameter existing = fields.get(parameter.getField());
            if (existing == null) {
                put(key, entry.getValue());
            } else {
                Object defaultValue = get(existing.getKey());
                if (defaultValue == null) {
                    put(existing.getKey(), entry.getValue());
                }
            }
        }
    }

    public void removeDefaults(ParameterList other) {
        for (Map.Entry<String, String> entry : other.entrySet()) {
            String otherDefault = entry.getValue();
            String thisDefault = get(entry.getKey());
            if (Objects.equals(otherDefault, thisDefault)) {
                remove(entry.getKey());
            }
        }
    }

    public void setCategory(String categoryKey, ParameterStore parameterStore) {
        for (String key : keySet()) {
            Parameter parameter = parameterStore.getParameter(key);
            if (parameter != null && parameter.getCategory().isEmpty()) {
                parameter.setCategory(categoryKey);
            }
        }
    }
}
