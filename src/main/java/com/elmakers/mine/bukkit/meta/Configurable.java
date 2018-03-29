package com.elmakers.mine.bukkit.meta;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.annotation.Nonnull;

import org.apache.commons.lang.StringUtils;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.base.CaseFormat;

public class Configurable {
    private String key;
    private String className;
    private String shortClass;
    private String name;
    private List<String> description;
    private List<String> parameters;
    private String category;

    protected Configurable() {

    }

    protected Configurable(@Nonnull Class<?> classType, @Nonnull Collection<Parameter> parameters, String classSuffix) {
        description = new ArrayList<>();
        description.add("");
        category = "";
        className = classType.getSimpleName();
        shortClass = className.replace(classSuffix, "");
        name = StringUtils.join(StringUtils.splitByCharacterTypeCamelCase(shortClass), ' ');
        key = CaseFormat.UPPER_CAMEL.to(CaseFormat.LOWER_UNDERSCORE, shortClass);
        this.parameters = new ArrayList<>();
        if (parameters != null) {
            for (Parameter parameter : parameters) {
                this.parameters.add(parameter.getKey());
            }
        }
    }

    @JsonProperty("class_name")
    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    @JsonProperty("short_class")
    public String getShortClass() {
        return shortClass;
    }

    public void setShortClass(String shortClass) {
        this.shortClass = shortClass;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<String> getDescription() {
        return description;
    }

    public void setDescription(List<String> description) {
        this.description = description;
    }

    public List<String> getParameters() {
        Collections.sort(parameters);
        return parameters;
    }

    public void setParameters(List<String> parameters) {
        this.parameters = parameters;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String categoryKey) {
        this.category = categoryKey;
    }

    public void merge(Configurable other, ParameterStore parameterStore) {
        Map<String, Parameter> fields = new HashMap<>();
        for (String key : parameters) {
            Parameter parameter = parameterStore.getParameter(key);
            if (parameter == null) {
                System.out.println("Missing parameter: " + key);
                continue;
            }
            fields.put(parameter.getField(), parameter);
        }

        for (String key : other.getParameters()) {
            Parameter parameter = parameterStore.getParameter(key);
            if (parameter == null) {
                System.out.println("Missing parameter: " + key);
                continue;
            }
            Parameter existing = fields.get(parameter.getField());
            if (existing == null) {
                parameters.add(key);
            }
        }
    }
}
