var mongoose = require('mongoose');
var Venue = mongoose.model("venue");


const createResponse = function (res, status, content) {
  res.status(status).json(content);
};



var calculateLastRating = function (venue, isDeleted) {
  if (!venue || !venue.comments) {
    console.log("calculateLastRating: venue veya comments yok");
    return;
  }

  var numComments = venue.comments.length;
  var sumRating = 0;
  var avgRating = venue.rating || 0;

  if (numComments === 0 && isDeleted) {
    
    avgRating = 0;
  } else if (numComments > 0) {
    for (var i = 0; i < numComments; i++) {
      sumRating += venue.comments[i].rating || 0;
    }
    avgRating = Math.ceil(sumRating / numComments);
  }

  venue.rating = avgRating;

  return venue.save()
    .then(function () {
      console.log("calculateLastRating: yeni rating =", avgRating);
    })
    .catch(function (err) {
      console.log("calculateLastRating save error:", err);
    });
};


var updateRating = function (venueId, isDeleted) {
  return Venue.findById(venueId)
    .select("rating comments")
    .exec()
    .then(function (venue) {
      if (!venue) {
        console.log("updateRating: venue bulunamadı");
        return;
      }
      return calculateLastRating(venue, isDeleted);
    })
    .catch(function (err) {
      console.log("updateRating hata:", err);
    });
};


const addComment = async function (req, res) {
  try {
    console.log("addComment body:", req.body);

  
    const venue = await Venue.findById(req.params.venueid).select("comments");

    if (!venue) {
      return createResponse(res, 404, { message: "Mekan bulunamadı" });
    }

   
    venue.comments.push({
      author: req.body.author,
      rating: req.body.rating,
      text: req.body.text
    });

    console.log("Kaydedilmeden önce comments length:", venue.comments.length);

    
    const updatedVenue = await venue.save();

    console.log("Kaydedildikten sonra comments length:", updatedVenue.comments.length);

    
    await updateRating(updatedVenue._id, false);

   
    const comment = updatedVenue.comments[updatedVenue.comments.length - 1];

    return createResponse(res, 201, comment);

  } catch (err) {
    console.log("addComment hata:", err);
    return createResponse(res, 400, err);
  }
};


const getComment = async function (req, res) {
  try {
    const venue = await Venue.findById(req.params.venueid)
      .select("name comments")
      .exec();

    if (!venue) {
      return createResponse(res, 404, "Mekanid yanlış");
    }

    const comment = venue.comments.id(req.params.commentid);

    if (!comment) {
      return createResponse(res, 404, "Yorum id yanlış");
    }

    const response = {
      venue: {
        name: venue.name,
        id: req.params.venueid
      },
      comment: comment
    };

    return createResponse(res, 200, response);

  } catch (error) {
    console.log("getComment hata:", error);
    return createResponse(res, 404, "Mekan bulunamadı");
  }
};

const updateComment = async function (req, res) {
    try{
        await Venue.findById(req.params.venueid)
        .select("comments")
        .exec()
        .then(function (venue) {
            try {
                let comment = venue.comments.id(req.params.commentid);
                comment.set(req.body);
                venue.save().then(function () {
                    updateRating(venue._id, false);
                    createResponse(res, 201, comment);
                });
            } catch (error) {
                createResponse(res, 400, error);
            }
    });
    } catch (error) {
        createResponse(res, 400, error);
    }
};
 


const deleteComment = async function (req, res) {
  try {
    
    const venue = await Venue.findById(req.params.venueid)
      .select("comments")
      .exec();

    if (!venue) {
      return createResponse(res, 404, { message: "Mekan bulunamadı" });
    }

    const commentId = (req.params.commentid || "").trim();

    
    const index = venue.comments.findIndex(
      c => c._id.toString() === commentId
    );

    if (index === -1) {
      
      console.log(
        "Yorum id eşleşmedi. Param:",
        commentId,
        "comments:",
        venue.comments.map(c => c._id.toString())
      );
      return createResponse(res, 404, { message: "Yorum id yanlış" });
    }

    const deleted = venue.comments[index];
    const authorName = deleted.author;

   
    venue.comments.splice(index, 1);

    await venue.save();

   
    await updateRating(venue._id, true);

  
    return createResponse(res, 200, {
      status: authorName + " isimli kişinin yorumu silindi"
    });

  } catch (error) {
    console.log("deleteComment hata:", error);
    return createResponse(res, 400, error);
  }
};





module.exports = {
  addComment,
  getComment,
  updateComment,
  deleteComment
};

