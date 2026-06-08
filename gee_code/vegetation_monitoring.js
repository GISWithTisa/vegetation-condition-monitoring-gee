GEE Code
// ====================================================================
// NDVI & Vegetation Monitoring Portfolio Project
// Tehran Neighborhoods (Mahale_352)
// ====================================================================


// ----------------------------------------------------
// STUDY AREA
// ----------------------------------------------------

var mahale =
ee.FeatureCollection(
'projects/ee-nahidnk1982/assets/Mahale_352'
);

Map.centerObject(mahale,11);


// ----------------------------------------------------
// CLOUD MASK FUNCTION
// ----------------------------------------------------

function maskLandsatQA(img){

var qa = img.select('QA_PIXEL');

var mask =
qa.bitwiseAnd(1 << 1).eq(0)
.and(qa.bitwiseAnd(1 << 2).eq(0))
.and(qa.bitwiseAnd(1 << 3).eq(0))
.and(qa.bitwiseAnd(1 << 4).eq(0))
.and(qa.bitwiseAnd(1 << 5).eq(0));

return img.updateMask(mask);

}


// ----------------------------------------------------
// LANDSAT COLLECTION FUNCTION
// ----------------------------------------------------

function getLandsatComposite(startDate,endDate){

var l8 =
ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
.filterBounds(mahale)
.filterDate(startDate,endDate)
.filter(ee.Filter.calendarRange(6,8,'month'))
.map(maskLandsatQA);

var l9 =
ee.ImageCollection('LANDSAT/LC09/C02/T1_L2')
.filterBounds(mahale)
.filterDate(startDate,endDate)
.filter(ee.Filter.calendarRange(6,8,'month'))
.map(maskLandsatQA);

return l8.merge(l9)
.median()
.clip(mahale);

}


// ----------------------------------------------------
// 2015 COMPOSITE
// ----------------------------------------------------

var landsat2015 =
getLandsatComposite(
'2015-06-01',
'2015-08-31'
);


// ----------------------------------------------------
// 2025 COMPOSITE
// ----------------------------------------------------

var landsat2025 =
getLandsatComposite(
'2025-06-01',
'2025-08-31'
);


// ----------------------------------------------------
// FALSE COLOR COMPOSITE
// ----------------------------------------------------

Map.addLayer(
landsat2025,
{
bands:['SR_B5','SR_B4','SR_B3'],
min:7000,
max:18000
},
'Landsat_FalseColor_2025'
);


// ----------------------------------------------------
// NDVI 2015
// ----------------------------------------------------

var NDVI_2015 =
landsat2015
.normalizedDifference(
['SR_B5','SR_B4']
)
.rename('NDVI_2015');


// ----------------------------------------------------
// NDVI 2025
// ----------------------------------------------------

var NDVI_2025 =
landsat2025
.normalizedDifference(
['SR_B5','SR_B4']
)
.rename('NDVI_2025');


// ----------------------------------------------------
// NDVI MAP
// ----------------------------------------------------

Map.addLayer(
NDVI_2025,
{
min:-0.2,
max:0.8,
palette:[
'brown',
'yellow',
'lightgreen',
'green',
'darkgreen'
]
},
'NDVI_2025'
);


// ----------------------------------------------------
// VEGETATION CONDITION CLASSIFICATION
// ----------------------------------------------------

var Vegetation_Condition_2025 =
ee.Image(0)

.where(
NDVI_2025.lt(0.2),
1
)

.where(
NDVI_2025.gte(0.2)
.and(NDVI_2025.lt(0.4)),
2
)

.where(
NDVI_2025.gte(0.4)
.and(NDVI_2025.lt(0.6)),
3
)

.where(
NDVI_2025.gte(0.6),
4
)

.rename(
'Vegetation_Condition_2025'
);


// ----------------------------------------------------
// DISPLAY CLASSIFIED MAP
// ----------------------------------------------------

Map.addLayer(
Vegetation_Condition_2025,
{
min:1,
max:4,
palette:[
'#d73027',
'#fee08b',
'#66bd63',
'#1a9850'
]
},
'Vegetation_Condition_2025'
);


// ----------------------------------------------------
// NDVI CHANGE MAP
// ----------------------------------------------------

var NDVI_Change_2015_2025 =
NDVI_2025
.subtract(
NDVI_2015
)
.rename(
'NDVI_Change_2015_2025'
);


Map.addLayer(
NDVI_Change_2015_2025,
{
min:-0.3,
max:0.3,
palette:[
'red',
'white',
'green'
]
},
'NDVI_Change_2015_2025'
);


// ----------------------------------------------------
// EXPORT 1
// NDVI
// ----------------------------------------------------

Export.image.toDrive({

image: NDVI_2025,

description:
'NDVI_2025',

folder:
'GEE_Exports',

fileNamePrefix:
'NDVI_2025',

region:
mahale.geometry(),

scale:30,

crs:'EPSG:32639',

maxPixels:1e13

});


// ----------------------------------------------------
// EXPORT 2
// VEGETATION CONDITION
// ----------------------------------------------------

Export.image.toDrive({

image:
Vegetation_Condition_2025,

description:
'Vegetation_Condition_2025',

folder:
'GEE_Exports',

fileNamePrefix:
'Vegetation_Condition_2025',

region:
mahale.geometry(),

scale:30,

crs:'EPSG:32639',

maxPixels:1e13

});


// ----------------------------------------------------
// EXPORT 3
// NDVI CHANGE
// ----------------------------------------------------

Export.image.toDrive({

image:
NDVI_Change_2015_2025,

description:
'NDVI_Change_2015_2025',

folder:
'GEE_Exports',

fileNamePrefix:
'NDVI_Change_2015_2025',

region:
mahale.geometry(),

scale:30,

crs:'EPSG:32639',

maxPixels:1e13

});


// ----------------------------------------------------
// EXPORT 4
// FALSE COLOR COMPOSITE
// ----------------------------------------------------

Export.image.toDrive({

image:
landsat2025.select(
['SR_B5','SR_B4','SR_B3']
),

description:
'Landsat_FalseColor_2025',

folder:
'GEE_Exports',

fileNamePrefix:
'Landsat_FalseColor_2025',

region:
mahale.geometry(),

scale:30,

crs:'EPSG:32639',

maxPixels:1e13

});
