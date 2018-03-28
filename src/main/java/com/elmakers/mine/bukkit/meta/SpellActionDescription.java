package com.elmakers.mine.bukkit.meta;

import java.util.Collection;
import javax.annotation.Nonnull;

import com.elmakers.mine.bukkit.api.action.SpellAction;

public class SpellActionDescription extends Configurable {

    public SpellActionDescription(@Nonnull Class<? extends SpellAction> actionClass, @Nonnull Collection<Parameter> parameters) {
        super(actionClass, parameters, "Action");
    }
}
