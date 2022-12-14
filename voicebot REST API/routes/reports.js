const express = require('express');
const { route } = require('express/lib/application');
const router = express.Router();
const Report = require('../models/Report');

// GET BACK ALL THE REPORTS
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find();
    res.json(reports);
  } catch (err) {
    res.json({ message: err });
  }
});

// SUBMITS A REPORT
router.post('/', async (req, res) => {
  const report = new Report({
    keycode: req.body.keycode,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    phonenumber: req.body.phonenumber,
    category: req.body.category,
    description: req.body.description,
  });
  try {
    const savedReport = await report.save();
    res.json(savedReport);
  } catch (err) {
    res.json({ message: err });
  }
});

// SPECIFIC REPORT
router.get('/:reportId', async (req, res) => {
  try {
    const report = await Report.findById(req.params.reportId);
    res.json(report);
  } catch (err) {
    res.json({ message: err });
  }
});

// SPECIFIC REPORT USING KEYCODE
router.get('/:reportId/:keycode', async (req, res) => {
  try {
    const report = await Report.findOne(
      { _id: req.params.reportId },
      { keycode: req.body.keycode }
      );
    res.json(report);
  } catch (err) {
    res.json({ message: err });
  }
});

// Delete Report
router.delete('/:reportId', async (req, res) => {
  try {
    const removedReport = await Report.remove({ _id: req.params.reportId });
    res.json(removedReport);
  } catch (err) {
    res.json({ message: err });
  }
});

// Update a report
router.patch('/:reportId', async (req, res) => {
  try {
    const updatedReport = await Report.updateOne(
      { _id: req.params.reportId },
      { $set: { description: req.body.description } }
    );
    res.json(updatedReport);
  } catch (err) {
    res.json({ message: err });
  }
});
module.exports = router;
