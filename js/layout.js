var BaseView = Backbone.View.extend({

});

var Article = BaseView.extend({

    initialize: function (data) {
        this.pages = [];
        this.blocks = [];
        this.currentFlowColumn = -1;

        this.addBlocks(data.blocks);
        this.setFlow(data.flow);
    },

    addBlocks: function (blocks) {
        _.each(blocks, this.addBlock, this);
    },

    setFlow: function (flow) {
        this.flow = {
            columns: flow.find('.column'),
            containers: flow.find('.container')
        };
    },

    createNewPage: function () {
        var page = new Page();
        this.el.appendChild(page.render().el);
        this.pages.push(page);

        return page;
    },

    getNextColumn: function () {
        this.currentFlowColumn += 1;

        if (this.currentFlowColumn === this.flow.columns.length) {
            return null;
        }

        return new Column({
            el: this.flow.columns.get(this.currentFlowColumn).cloneNode()
        });
    },

    addBlock: function (block) {
        if (!(block instanceof Block)) {
            block = new Block({el: block});
        }

        this.blocks.push(block);
    },

    render: function() {
        this.distributeElements();

        return this;
    },

    distributeElements: function () {
        var column = this.getNextColumn(),
            columnContentHeight = 0;

        var prevBlock;

        var page = this.createNewPage(),
            pageHeight = page.offsetHeight;

        var overflowBlock,
            overflow = 0;

        _.each(this.blocks, function (block) {
            if (overflow > 0) {
                column = this.getNextColumn();
                if (!column) {
                    page = this.createNewPage();
                    this.currentFlowColumn = -1;
                    column = this.getNextColumn();
                }
            }

            page.addColumn(column.render());

            if (overflow > 0) {
                overflowBlock = prevBlock.clone();
                column.addBlock(overflowBlock);
                overflowBlock.el.style['marginTop']= (overflow - overflowBlock.getHeight()) + 'px';

                columnContentHeight = overflow;
                console.log(overflow, overflow - overflowBlock.getHeight());
            }

            column.addBlock(block);

            columnContentHeight += block.getHeight();
            overflow = columnContentHeight - column.getHeight();

            console.log('blockHeight', block.getHeight(), 'columnContentHeight', columnContentHeight, 'totalColumnHeight', column.getHeight(), overflow, block.el);
            prevBlock = block;
        }, this);
    }
});

var Page = BaseView.extend({

    className: 'page',

    contentDimensions: null,

    initialize: function (data) {
        this.contentDimensions = {
            width: 0,
            height: 0
        };
    },

    render: function () {
        return this;
    },

    addColumn: function (column) {
        this.el.appendChild(column.el);

        this.contentDimensions.height += column.offsetHeight;
        this.contentDimensions.width += column.offsetWidth;
    }

});

var Column = BaseView.extend({

    className: 'column',

    initialize: function (data) {
        this.blocks = data.blocks || [];
        this.height = 0;
        this.maxHeight = data.maxHeight || 0;
    },

    addBlock: function (block) {
        this.el.appendChild(block.el);
        this.blocks.push(block);
        this.height += block.offsetHeight;
    },

    hasSpaceLeft: function () {
        // return this.height 
    },

    getHeight: function () {
        return this.el.offsetHeight;
    }

});


var Block = BaseView.extend({

    initialize: function () {

    },

    clone: function () {
        var clone = _.clone(this);
        clone.el = this.el.cloneNode(true);

        return clone;
    },

    getHeight: function () {
        return this.el.offsetHeight;
    }

});
