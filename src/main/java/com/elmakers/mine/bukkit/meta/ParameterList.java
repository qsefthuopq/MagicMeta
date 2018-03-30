package com.elmakers.mine.bukkit.meta;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
        put(parameter.getKey(), defaultValue == null ? null : defaultValue.toString());
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

    public void removeAll(ParameterList other) {
        for (String key : other.keySet()) {
            remove(key);
        }
    }

    public void setCategory(String categoryKey, ParameterStore parameterStore) {
        for (String key : keySet()) {
            Parameter parameter = parameterStore.getParameter(key);
            if (parameter != null) {
                parameter.setCategory(categoryKey);
            }
        }
    }
}
