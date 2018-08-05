function Tutorial(mask)
{
    this.current = null;
    this.mask = mask;
    var me = this;
    this.nextFunction = function() {
        me.next();
    };
    if (mask) {
        mask.click(this.nextFunction);
    }
    $(document).keyup(function (e) {
        if (e.keyCode === 13) {
            me.next();
        }
        if (e.keyCode === 27) {
            me.close();
        }
    });
};

Tutorial.prototype.start = function(section) {
    this.show(section);
};

Tutorial.prototype.next = function() {
    if (!this.current) return;

    this.current.hide();
    var next = this.current.data('next');
    if (next) {
        this.show($('#' + next));
    } else if (this.mask) {
        this.mask.hide();
    }
};

Tutorial.prototype.show = function(section) {
    if (this.mask) {
        this.mask.show();
    }
    this.current = section;
    var my = section.data('my') ? section.data('my') : 'center';
    var at = section.data('at') ? section.data('at') : 'center';
    var of = section.data('of') ? '#' + section.data('of') : 'body';
    section.show();
    section.position({
        my: my,
        at: at,
        of: of
    });
    section.click(this.nextFunction);
};

Tutorial.prototype.close = function() {
    if (this.current) {
        this.current.hide();
        this.current = null;
    }
    if (this.mask) {
        this.mask.hide();
    }
};