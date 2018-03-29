package com.elmakers.mine.bukkit.meta;

import java.util.ArrayList;
import java.util.List;
import javax.annotation.Nonnull;

import org.apache.commons.lang.WordUtils;
import com.fasterxml.jackson.annotation.JsonIgnore;

public class Parameter {
    private String key;
    private String name;
    private String field;
    private List<String> description;
    private String type;
    private String category;
    private String alias;

    public Parameter() {
    }

    public Parameter(@Nonnull String key, @Nonnull String field, @Nonnull ParameterType type) {
        this.field = field;
        this.key = key;
        this.type = type.getKey();
        this.category = "";

        description = new ArrayList<>();
        description.add("");
        name = WordUtils.capitalizeFully(field, new char[]{'_'}).replaceAll("_", " ");

    }

    public Parameter(@Nonnull String field, @Nonnull ParameterType type) {
        this(field, field, type);
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

    public void setKey(String key) {
        this.key = key;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getField() {
        return field;
    }

    public void setField(String field) {
        this.field = field;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public List<String> getDescription() {
        return description;
    }

    public void setDescription(List<String> description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String categoryKey) {
        this.category = categoryKey;
    }

    public String getAlias() {
        return alias;
    }

    public void setAlias(String alias) {
        this.alias = alias;
    }
}
