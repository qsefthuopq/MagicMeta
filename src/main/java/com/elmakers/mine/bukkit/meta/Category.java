package com.elmakers.mine.bukkit.meta;

import org.apache.commons.lang.WordUtils;
import com.fasterxml.jackson.annotation.JsonIgnore;

public class Category {
    private String key;
    private String name;
    private String description;

    public Category(String key) {
        this.key = key;
        name = WordUtils.capitalizeFully(key, new char[]{'_'}).replaceAll("_", " ");
        description = "";
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
}
