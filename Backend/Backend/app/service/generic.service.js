exports.getAll = async (Model) => {
    return await Model.find();
};

exports.create = async (Model, data) => {
    return await Model.create(data);
};

exports.update = async (Model, id, data) => {
    return await Model.findByIdAndUpdate(id, data);
};

exports.getById = async (Model, id) => {
    return await Model.findById(id);
};

exports.deleteById = async (Model, id) => {
    return await Model.findByIdAndDelete(id);
};
exports.deleteMany = async (Model, id) => {
    return await Model.findByIdsAndDelete(id);
}
exports.updateStatus = async (Model, id, changeStatus) => {
    if (!['Active', 'Inactive'].includes(changeStatus)) {
        throw new Error('Invalid status value');
    }

    return await Model.findByIdAndUpdate(id, { status: changeStatus });
};