var mongoose = require('mongoose');
var Venue = mongoose.model("venue");

const createResponse = function (res, status, content) {
    res.status(status).json(content);
}

var converter = (function () {
    var earthRadius = 6371; // km
    var radian2Kilometer = function (radian) {
        return parseFloat(radian * earthRadius);
    };
    var kilometer2Radian = function (distance) {
        return parseFloat(distance / earthRadius);
    };
    return {
        radian2Kilometer, kilometer2Radian,
    }
})();

const listVenues = function (req, res) {
  const lat = parseFloat(req.query.lat);
  const long = parseFloat(req.query.long);

  if (isNaN(lat) || isNaN(long)) {
    return createResponse(res, 400, { message: "lat ve long zorunlu" });
  }

  const point = { type: "Point", coordinates: [long, lat] }; // ✅ [LONG, LAT]

  const geoOptions = {
    distanceField: "distance",
    spherical: true,
    maxDistance: 10000 // ✅ metre (10 km)
  };

  Venue.aggregate([{ $geoNear: { near: point, ...geoOptions } }])
    .then((result) => {
      const venues = result.map(v => ({
        distance: v.distance, // metre
        name: v.name,
        address: v.address,
        rating: v.rating,
        foodanddrink: v.foodanddrink,
        id: v._id,
      }));
      return createResponse(res, 200, venues.length ? venues : { status: "Civarda mekan yok" });
    })
    .catch((err) => {
      return createResponse(res, 500, { message: "Sunucu hatası", error: err.message || err });
    });
};


const addVenue = async function (req, res) {
    try {
        await Venue.create({
            ...req.body,
            coordinates: [parseFloat(req.body.long), parseFloat(req.body.lat)],
hours: [
                {
                    day: req.body.day1
                    , open: req.body.open1
                    , close: req.body.close1
                    , isClosed: req.body.isClosed1
                },

                {
                    day: req.body.day2
                    , open: req.body.open2
                    , close: req.body.close2
                    , isClosed: req.body.isClosed2

                }
            ]}).then(function (venue) {
                createResponse(res, 201, venue);
            });
    }
    catch (error) {
        createResponse(res, 400, error);
        return;
    }

    //createResponse(res, 200, { status: "başarılı" }); 
}

const getVenue = async function (req, res) {
    try {
        await Venue.findById(req.params.venueid).exec().then(function (venue) {
            createResponse(res, 200, venue);
        });

    }
    catch (error) {
        createResponse(res, 404, { status: "böyle bir mekan yok" });
    }
    //createResponse(res,200,{status:"getvenue başarılı"});
}

const updateVenue = async function (req, res) {
  try {
    const updatedVenue = await Venue.findByIdAndUpdate(
      req.params.venueid,   
      {
        ...req.body,
        coordinates: [
          parseFloat(req.body.lat),
          parseFloat(req.body.long)
        ],
        hours: [
          {
            day: req.body.day1,         
            open: req.body.open1,
            close: req.body.close1,
            isClosed: req.body.isClosed1
          },
          {
            day: req.body.day2,         
            open: req.body.open2,
            close: req.body.close2,
            isClosed: req.body.isClosed2
          }
        ]
      },
      { new: true, runValidators: true }   
    );

    if (!updatedVenue) {
      return createResponse(res, 404, { status: "böyle bir mekan yok" });
    }

    return createResponse(res, 200, updatedVenue);
  } catch (error) {
    console.log("updateVenue hata:", error);
    return createResponse(res, 400, { status: "güncelleme başarısız", error });
  }
};

    


const deleteVenue = async function (req, res) {
    try {
       await Venue.findByIdAndDelete(req.params.venueid).then(function (venue) {
        createResponse(res, 200, { status: venue.name + " isimli mekan silindi" });
         });
    } catch (error) {
        createResponse(res, 404, { status: "böyle bir mekan yok" });
    }
};

module.exports = {
    listVenues,
    addVenue,
    getVenue,
    updateVenue,
    deleteVenue
}