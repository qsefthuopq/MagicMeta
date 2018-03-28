package com.elmakers.mine.bukkit.meta;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import javax.annotation.Nonnull;

import org.apache.commons.lang.StringUtils;
import com.google.common.base.CaseFormat;

public class Configurable {
    private String key;
    private String className;
    private String shortClass;
    private String name;
    private List<String> description;
    private Collection<Parameter> parameters;
    private Category category;

    public Configurable(@Nonnull Class<?> classType, @Nonnull Collection<Parameter> parameters, String classSuffix) {
        description = new ArrayList<>();
        description.add("");
        className = classType.getSimpleName();
        shortClass = className.replace(classSuffix, "");
        name = StringUtils.join(StringUtils.splitByCharacterTypeCamelCase(shortClass), ' ');
        key = CaseFormat.UPPER_CAMEL.to(CaseFormat.LOWER_UNDERSCORE, shortClass);
        this.parameters = parameters;
    }

    public String getClassName() {
        return className;
    }

    public String getShortClass() {
        return shortClass;
    }

    public String getKey() {
        return key;
    }

    public String getName() {
        return name;
    }

    public List<String> getDescription() {
        return description;
    }

    public List<String> getParameters() {
        List<String> parameterNames = new ArrayList<>();
        if (parameters != null) {
            for (Parameter parameter : parameters) {
                parameterNames.add(parameter.getKey());
            }
        }
        Collections.sort(parameterNames);
        return parameterNames;
    }

    public void setParameters(Collection<Parameter> parameters) {
        this.parameters = parameters;
    }

    public String getCategory() {
        return category == null ? "" : category.getKey();
    }
}
