(
function($, undefined)
{
    $.ui.slider.prototype.options =
        $.extend(
            {},
            $.ui.slider.prototype.options,
            {
                paddingMin: 0,
                paddingMax: 0
            }
        );

    $.ui.slider.prototype._refreshValue =
        function() {
            var
                oRange = this.options.range,
                o = this.options,
                self = this,
                animate = ( !this._animateOff ) ? o.animate : false,
                valPercent,
                _set = {},
                elementWidth,
                elementHeight,
                paddingMinPercent,
                paddingMaxPercent,
                paddedBarPercent,
                lastValPercent,
                value,
                valueMin,
                valueMax;

            if (self.orientation === "horizontal")
            {
                elementWidth = this.element.outerWidth();
                paddingMinPercent = o.paddingMin * 100 / elementWidth;
                paddedBarPercent = ( elementWidth - ( o.paddingMin + o.paddingMax) ) * 100 / elementWidth;
            }
            else
            {
                elementHeight = this.element.outerHeight();
                paddingMinPercent = o.paddingMin * 100 / elementHeight;
                paddedBarPercent = ( elementHeight - ( o.paddingMin + o.paddingMax) ) * 100 / elementHeight;
            }

            if ( this.options.values && this.options.values.length ) {
                this.handles.each(function( i, j ) {
                    valPercent =
                        ( ( self.values(i) - self._valueMin() ) / ( self._valueMax() - self._valueMin() ) * 100 )
                        * paddedBarPercent / 100 + paddingMinPercent;
                    _set[ self.orientation === "horizontal" ? "left" : "bottom" ] = valPercent + "%";
                    $( this ).stop( 1, 1 )[ animate ? "animate" : "css" ]( _set, o.animate );
                    if ( self.options.range === true ) {
                        if ( self.orientation === "horizontal" ) {
                            if ( i === 0 ) {
                                self.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { left: valPercent + "%" }, o.animate );
                            }
                            if ( i === 1 ) {
                                self.range[ animate ? "animate" : "css" ]( { width: ( valPercent - lastValPercent ) + "%" }, { queue: false, duration: o.animate } );
                            }
                        } else {
                            if ( i === 0 ) {
                                self.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { bottom: ( valPercent ) + "%" }, o.animate );
                            }
                            if ( i === 1 ) {
                                self.range[ animate ? "animate" : "css" ]( { height: ( valPercent - lastValPercent ) + "%" }, { queue: false, duration: o.animate } );
                            }
                        }
                    }
                    lastValPercent = valPercent;
                });
            } else {
                value = this.value();
                valueMin = this._valueMin();
                valueMax = this._valueMax();
                valPercent =
                    ( ( valueMax !== valueMin )
                    ? ( value - valueMin ) / ( valueMax - valueMin ) * 100
                    : 0 )
                    * paddedBarPercent / 100 + paddingMinPercent;

                _set[ self.orientation === "horizontal" ? "left" : "bottom" ] = valPercent + "%";

                this.handle.stop( 1, 1 )[ animate ? "animate" : "css" ]( _set, o.animate );

                if ( oRange === "min" && this.orientation === "horizontal" ) {
                    this.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { width: valPercent + "%" }, o.animate );
                }
                if ( oRange === "max" && this.orientation === "horizontal" ) {
                    this.range[ animate ? "animate" : "css" ]( { width: ( 100 - valPercent ) + "%" }, { queue: false, duration: o.animate } );
                }
                if ( oRange === "min" && this.orientation === "vertical" ) {
                    this.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { height: valPercent + "%" }, o.animate );
                }
                if ( oRange === "max" && this.orientation === "vertical" ) {
                    this.range[ animate ? "animate" : "css" ]( { height: ( 100 - valPercent ) + "%" }, { queue: false, duration: o.animate } );
                }
            }
        };

    $.ui.slider.prototype._normValueFromMouse =
        function( position ) {
            var
                o = this.options,
                pixelTotal,
                pixelMouse,
                percentMouse,
                valueTotal,
                valueMouse;

            if ( this.orientation === "horizontal" ) {
                pixelTotal = this.elementSize.width - (o.paddingMin + o.paddingMax);
                pixelMouse = position.x - this.elementOffset.left - o.paddingMin - ( this._clickOffset ? this._clickOffset.left : 0 );
            } else {
                pixelTotal = this.elementSize.height - (o.paddingMin + o.paddingMax);
                pixelMouse = position.y - this.elementOffset.top - o.paddingMin - ( this._clickOffset ? this._clickOffset.top : 0 );
            }

            percentMouse = ( pixelMouse / pixelTotal );
            if ( percentMouse > 1 ) {
                percentMouse = 1;
            }
            if ( percentMouse < 0 ) {
                percentMouse = 0;
            }
            if ( this.orientation === "vertical" ) {
                percentMouse = 1 - percentMouse;
            }

            valueTotal = this._valueMax() - this._valueMin();
            valueMouse = this._valueMin() + percentMouse * valueTotal;

            return this._trimAlignValue( valueMouse );
        };
}
)(jQuery);

var processor_arr = 		new Array('2.4 Ghz','2.6 Ghz','2.8 Ghz','3.4 Ghz','3.6 Ghz');
var ram_arr = 		new Array('16GB','32GB','64GB','128GB','256GB');
var storage_arr = 	new Array('150 GB','200 GB','250 GB','300 GB','350 GB');
var bandwidth_arr = new Array('100 GB','4 TB','6 TB','8 TB','10 TB');
var ip_arr = new Array('01','02','03','04','05');
var price_arr = 	new Array('129','139','149','159','169');
var point_arr = 	new Array('.00','.00','.00','.00','.00');
var link_arr = 		new Array('10','25','50','75','100');
var b_url = 'https://www.your-domain.com/?cmd=cart&action=add&id=';

// This is what you want the default position to be
var def_pos = 3;

$(document).ready(function() {
    function setSlider() {
        var paddingMin, paddingMax;

        if (window.innerWidth < 575) { // Example breakpoint for mobile
            paddingMin = 30; // Mobile padding
            paddingMax = 30;
        } else if (window.innerWidth < 767) { // Example breakpoint for tablet
            paddingMin = 50; // Tablet padding
            paddingMax = 40;
        } else if (window.innerWidth < 991) { // Example breakpoint for tablet
            paddingMin = 68; // Tablet padding
            paddingMax = 60;
        } else { // Desktop
            paddingMin = 100; // Desktop padding
            paddingMax = 100;
        }

        $("#slider").slider("option", {
            paddingMin: paddingMin,
            paddingMax: paddingMax
        });
    }

    // Initialize the slider
    $("#slider").slider({
        range: 'min',
        animate: true,
        min: 1,
        max: 5,
        slide: function(event, ui) {
            updateValues(ui);
        },
        change: function(event, ui) {
            updateValues(ui);
        }
    });

    // Function to update the displayed values
    function updateValues(ui) {
        $('.slider-container #storage_val span.value').html(storage_arr[ui.value - 1]);
        $('.slider-container #processor_val span.value').html(processor_arr[ui.value - 1]);
        $('.slider-container #ram_val span.value').html(ram_arr[ui.value - 1]);
        $('.slider-container #bandwidth_val span.value').html(bandwidth_arr[ui.value - 1]);
        $('.slider-container #ip_val span.value').html(ip_arr[ui.value - 1]);
        $('.slider-container #price_val').html(price_arr[ui.value - 1]);
        $('.slider-container #point_val').html(point_arr[ui.value - 1]);
        $('.slider-container a.buynow-button').attr('href', b_url + link_arr[ui.value - 1]);
        $(".slider-container div.price_rangetxt div").removeClass("current");
        for (var i = 0; i < ui.value; i++) {
            $(".slider-container div.price_rangetxt div#icon-" + i).addClass("current");
        }
    }

    // Set the initial slider padding
    setSlider();

    // Adjust the slider on window resize
    $(window).resize(function() {
        setSlider();
    });

    // Initial value setup
    $("#amount").val("$" + $("#slider").slider("value"));
    $('#slider').slider('value', def_pos);

    $('.icon').click(function() {
        ch_value = parseInt(this.id.slice(5)) + 1;
        $(".slider-container div.price_rangetxt div").removeClass("current");
        $('#slider').slider('value', ch_value);
    });
});
