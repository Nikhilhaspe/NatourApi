// utilitis
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      next(new AppError('No document found with that id!', 404));
      return;
    }

    res.status(204).json({ status: 'success', data: null });
    return;
  });
};

exports.updateOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const newDoc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!newDoc) {
      next(new AppError('No document found with the given ID', 404));
      return;
    }

    res.status(200).json({ status: 'success', data: { data: newDoc } });
    return;
  });
};

exports.createOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);

    res.status(201).json({ status: 'success', data: { data: newDoc } });
  });
};

exports.getOne = (Model, popOptions) => {
  return catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);

    const doc = await query;

    if (!doc) {
      next(new AppError('No document found with the given ID', 404));
      return;
    }

    res.status(200).json({ status: 'success', data: { data: doc } });
    return;
  });
};

exports.getAll = (Model) => {
  return catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const docs = await features.query;
    // const docs = await features.query.explain();

    res.status(200).send({
      status: 'success',
      results: docs.length,
      data: {
        data: docs,
      },
    });

    return;
  });
};
