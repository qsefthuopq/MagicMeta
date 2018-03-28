package com.elmakers.mine.bukkit.meta;

import javax.annotation.Nonnull;

import org.apache.commons.lang.WordUtils;
import com.fasterxml.jackson.annotation.JsonIgnore;

public class Parameter {
    private String key;
    private String name;
    private String description;
    private String field;
    private ParameterType type;
    private Category category;

    public Parameter(@Nonnull String field, @Nonnull ParameterType type) {
        this.field = field;
        this.key = field;
        this.type = type;

        description = "";
        name = WordUtils.capitalizeFully(field, new char[]{'_'}).replaceAll("_", " ");
    }

    @Override
    public int hashCode() {
        return name.hashCode();
    }

    @Override
    public boolean equals(Object other) {
        return (other instanceof Parameter) && name.equals(((Parameter)other).name);
    }

    @JsonIgnore
    public String getKey() {
        return key;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getField() {
        return field;
    }

    public String getType() {
        return type.getKey();
    }

    public String getCategory() {
        return category == null ? "" : category.getKey();
    }
}
