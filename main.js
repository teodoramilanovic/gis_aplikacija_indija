var mapView = new ol.View({
    center: ol.proj.fromLonLat([72, 23]),
    zoom: 5
});

var osmTile = new ol.layer.Tile({
    title: 'Open Street Map',
    visible: true,
    source: new ol.source.OSM()
});

var formatWFS = new ol.format.WFS();

var sourceWFS = new ol.source.Vector({
    loader: function (extent) {
        $.ajax('http://localhost:8080/geoserver/teodora/ows', {
            type: 'GET',
            data: {
                service: 'WFS',
                version: '1.1.0',
                request: 'GetFeature',
                typename: 'ind_adm1_pg',
                srsname: 'EPSG:3857',
                bbox: extent.join(',') + ',EPSG:3857'
            }
        }).done(function (response) {
            sourceWFS.addFeatures(formatWFS.readFeatures(response));
        });
    },
    strategy: ol.loadingstrategy.bbox,
    projection: 'EPSG:3857'
});

var IndiaStates = new ol.layer.Vector({
    source: sourceWFS,
    title: 'Indian States',
    style: function (f) {
        return new ol.style.Style({
            stroke: new ol.style.Stroke({
                width: 1,
                color: [0, 204, 102]
            }),
            fill: new ol.style.Fill({
                color: [153, 255, 204, .2]
            })
        })
    }

});


var IndiaRdTile = new ol.layer.Tile({
    title: "Indian Roads",
    source: new ol.source.TileWMS({
        url: "http://localhost:8080/geoserver/teodora/wms",
        params: { 'LAYERS': 'teodora:ind_roads_pg', 'TILED': true },
        serverType: 'geoserver',
        visible: true
    })
});


var IndiaRrTile = new ol.layer.Tile({
    title: "Indian Railroads",
    source: new ol.source.TileWMS({
        url: "http://localhost:8080/geoserver/teodora/wms",
        params: { 'LAYERS': 'teodora:ind_rails_pg', 'TILED': true },
        serverType: 'geoserver',
        visible: true
    })
});


var IndiaRvTile = new ol.layer.Tile({
    title: "Indian Rivers",
    source: new ol.source.TileWMS({
        url: "http://localhost:8080/geoserver/teodora/wms",
        params: { 'LAYERS': 'teodora:ind_water_lines_dcw_pg', 'TILED': true },
        serverType: 'geoserver',
        visible: true
    })
});


var IndiaLkTile = new ol.layer.Tile({
    title: "Indian Lakes",
    source: new ol.source.TileWMS({
        url: "http://localhost:8080/geoserver/teodora/wms",
        params: { 'LAYERS': 'ind_water_areas_dcw_pg', 'TILED': true },
        serverType: 'geoserver',
        visible: true
    })
});

var interaction;

var interactionSelectPointerMove = new ol.interaction.Select({
    condition: ol.events.condition.pointerMove
});

var select = new ol.interaction.Select({
    hitTolerance: 5,
    multi: true,
    condition: ol.events.condition.doubleClick
});

var map = new ol.Map({
    layers: [
        osmTile,
        IndiaStates,
        IndiaRdTile,
        IndiaRrTile,
        IndiaRvTile,
        IndiaLkTile
    ],
    target: 'map',
    view: mapView,
    controls: [
        new ol.control.Zoom(),
        new ol.control.MousePosition(),
        new ol.control.LayerSwitcher()
    ],
    interactions: [
        interactionSelectPointerMove,
        select,
        new ol.interaction.MouseWheelZoom(),
        new ol.interaction.DragPan()
    ]
});

var popup = new ol.Overlay.PopupFeature({
    popupClass: 'default anim',
    select: select,
    canFix: true,
    template: {
        attributes:
        {
            'name_1': { title: 'Name:' }
        }
    }
});

map.addOverlay(popup);

$("#analize_dugme").click(function () {
    $("#analizeModal").modal("show");
});

function analize() {

    var naziv = $("#naziv").val();
    var povrsina = $("#povrsina").val();
    
    $.ajax({
        type: 'POST',
        url: 'analize.php',
        data: {

            naziv: naziv,
            povrsina: povrsina

        },
        success: function (data) {
            alert('Analysis completed');
        }
    });

}


$(document).on('click', '#submit_dodaj_analize', function (e) {
    e.preventDefault();

    var analizeWMS = new ol.layer.Tile({
        title: "Lake Analysis",
        name: 'Analysis',
        source: new ol.source.TileWMS({
            url: "http://localhost:8080/geoserver/teodora/wms",
            params: { 'LAYERS': 'teodora:analize', 'TILED': true },
            serverType: 'geoserver',
            visible: true
        })
    });
    map.addLayer(analizeWMS);
    map.updateSize();

    return false;
});

function dugme_open_analiza_brisanje() {
    map.getLayers().getArray()
        .filter(layer => layer.get('name') === 'Analysis')
        .forEach(layer => map.removeLayer(layer));
    map.updateSize();
}

var scaleControl = new ol.control.ScaleLine({
    bar:true,
    text:true
});

map.addControl(scaleControl);