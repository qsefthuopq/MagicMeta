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
    private ParameterType type;
    private Category category;

    public Parameter(@Nonnull String field, @Nonnull ParameterType type) {
        this.field = field;
        this.key = field;
        this.type = type;

        description = new ArrayList<>();
        description.add("");
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

    public String getField() {
        return field;
    }

    public String getType() {
        return type.getKey();
    }

    public List<String> getDescription() {
        return description;
    }

    public String getCategory() {
        return category == null ? "" : category.getKey();
    }

    public void setCategory(Category category) {
        this.category = category;
    }
}
