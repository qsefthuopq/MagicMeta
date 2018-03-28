package com.elmakers.mine.bukkit.meta;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.TreeNode;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

/**
 * An object mapper that writes keys out in a specific order to make diffs work better.
 */
public class SortedObjectMapper extends ObjectMapper {

    public SortedObjectMapper() {
        super();
        configure(MapperFeature.SORT_PROPERTIES_ALPHABETICALLY, true);
        configure(SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS, true);
    }

    @Override
    public String writeValueAsString(Object value) throws JsonProcessingException {
        if (value instanceof TreeNode) {
            // This works around an annoying issue where ORDER_MAP_ENTRIES_BY_KEYS does not
            // actually work for JSON trees, it only works for Maps
            // So we have to convert to an Object first, which converts trees to Maps.
            value = treeToValue((TreeNode)value, Object.class);
        }
        return super.writeValueAsString(value);
    }
}
