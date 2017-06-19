const mongoose = require('mongoose');

const FirearmSchema = mongoose.Schema({
    manufacturer: {type: String, required: true},
    model: {type: String, required: true},
    chambering: String,
    type: String,
    serial_number: String,
    image: String,
    value: Number,
    sold: Boolean,
    buyer: String
})

FirearmSchema.virtual('fullName').get(function() {
  return `${this.manufacturer} ${this.model} ${this.chambering}`.trim()
});


FirearmSchema.methods.apiRepr = function() {
  return {
    id: this._id,
    manufacturer: this.manufacturer,
    model: this.model,
    chambering: this.chambering,
    type: this.type,
    serial_number: this.serial_number,
    image: this.image,
    value: this.value,
    sold: this.sold,
    buyer: this.buyer,
    fullName: this.fullName,
  };
}


const firearm = mongoose.model('guns', FirearmSchema);

module.exports = {firearm};
