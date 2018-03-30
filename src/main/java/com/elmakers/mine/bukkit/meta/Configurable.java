package com.elmakers.mine.bukkit.meta;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import javax.annotation.Nonnull;

import org.apache.commons.lang.StringUtils;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.base.CaseFormat;

public class Configurable {
    private String key;
    private String className;
    private String shortClass;
    private String name;
    private List<String> description;
    private ParameterList parameters;
    private String category;
    private List<String> examples;

    protected Configurable() {

    }

    protected Configurable(@Nonnull Class<?> classType, @Nonnull ParameterList parameters, String classSuffix) {
        description = new ArrayList<>();
        description.add("");
        category = "";
        examples = new ArrayList<>();
        className = classType.getSimpleName();
        shortClass = className.replace(classSuffix, "");
        name = StringUtils.join(StringUtils.splitByCharacterTypeCamelCase(shortClass), ' ');
        key = CaseFormat.UPPER_CAMEL.to(CaseFormat.LOWER_UNDERSCORE, shortClass);
        this.parameters = parameters;
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

    @JsonIgnore
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

    public ParameterList getParameters() {
        return parameters;
    }

    public void setParameters(List<String> parameters) {
        this.parameters = new ParameterList(parameters);
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String categoryKey) {
        this.category = categoryKey;
    }

    public void merge(Configurable other, ParameterStore parameterStore) {
        parameters.merge(other.getParameters(), parameterStore);

        if (category == null || category.isEmpty()) {
            category = other.getCategory();
        }
    }

    public List<String> getExamples() {
        Collections.sort(examples);
        return examples;
    }

    public void setExamples(List<String> examples) {
        this.examples = examples;
    }
}
