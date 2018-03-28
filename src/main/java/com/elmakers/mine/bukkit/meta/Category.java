package com.elmakers.mine.bukkit.meta;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang.WordUtils;
import com.fasterxml.jackson.annotation.JsonIgnore;

public class Category {
    private String key;
    private String name;
    private List<String> description;

    public Category(String key) {
        this.key = key;
        name = WordUtils.capitalizeFully(key, new char[]{'_'}).replaceAll("_", " ");
        description = new ArrayList<>();
        description.add("");
    }

    @JsonIgnore
    public String getKey() {
        return key;
    }

    public String getName() {
        return name;
    }

    public List<String> getDescription() {
        return description;
    }
}
