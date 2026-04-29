const Duty = require('../models/Duty');
const User = require('../models/User');

const INCENTIVE_AMOUNT = 500;
const INCENTIVE_TYPES = ['BEFORE_OFFICE', 'AFTER_OFFICE'];

exports.getDutyReport = async (req, res, next) => {
  try {
    const { officerId, airportId, status, dateFrom, dateTo } = req.query;
    const filter = {};

    if (req.user.role === 'OFFICER') filter.officerId = req.user._id;
    if (officerId && req.user.role === 'ADMIN') filter.officerId = officerId;
    if (airportId) filter.airportId = airportId;
    if (status) filter.status = status;
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = dateFrom;
      if (dateTo) filter.date.$lte = dateTo;
    }

    const duties = await Duty.find(filter).sort({ date: -1 });
    const completedIncentiveDuties = duties.filter(
      d => d.status === 'COMPLETED' && INCENTIVE_TYPES.includes(d.officeType)
    );

    res.json({
      duties: duties.map(d => d.toJSON()),
      summary: {
        total: duties.length,
        completed: duties.filter(d => d.status === 'COMPLETED').length,
        upcoming: duties.filter(d => d.status === 'UPCOMING').length,
        cancelled: duties.filter(d => d.status === 'CANCELLED').length,
        totalIncentive: completedIncentiveDuties.length * INCENTIVE_AMOUNT,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getSubordinateReport = async (req, res, next) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const dutyFilter = {};

    if (dateFrom || dateTo) {
      dutyFilter.date = {};
      if (dateFrom) dutyFilter.date.$gte = dateFrom;
      if (dateTo) dutyFilter.date.$lte = dateTo;
    }

    const officers = await User.find({ role: 'OFFICER' });
    const duties = await Duty.find(dutyFilter);

    const report = officers.map(officer => {
      const officerDuties = duties.filter(
        d => d.officerId.toString() === officer._id.toString()
      );
      const completedIncentive = officerDuties.filter(
        d => d.status === 'COMPLETED' && INCENTIVE_TYPES.includes(d.officeType)
      );
      return {
        officer: officer.toJSON(),
        totalDuties: officerDuties.length,
        completed: officerDuties.filter(d => d.status === 'COMPLETED').length,
        upcoming: officerDuties.filter(d => d.status === 'UPCOMING').length,
        cancelled: officerDuties.filter(d => d.status === 'CANCELLED').length,
        beforeOffice: officerDuties.filter(d => d.officeType === 'BEFORE_OFFICE').length,
        afterOffice: officerDuties.filter(d => d.officeType === 'AFTER_OFFICE').length,
        totalIncentive: completedIncentive.length * INCENTIVE_AMOUNT,
      };
    });

    res.json(report);
  } catch (err) {
    next(err);
  }
};
