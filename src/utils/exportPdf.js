import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import {Alert} from 'react-native';

const PRIMARY = '#1E3A5F';
const SECONDARY = '#F59E0B';
const SUCCESS = '#10B981';
const ERROR = '#EF4444';

const baseStyles = `
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #111827; background: #fff; padding: 24px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 3px solid ${PRIMARY}; padding-bottom: 12px; }
    .org-name { font-size: 18px; font-weight: bold; color: ${PRIMARY}; }
    .org-sub { font-size: 11px; color: #6B7280; margin-top: 2px; }
    .report-meta { text-align: right; font-size: 10px; color: #6B7280; }
    .report-title { font-size: 14px; font-weight: bold; color: ${PRIMARY}; margin-bottom: 14px; }
    .summary { display: flex; gap: 10px; margin-bottom: 16px; }
    .summary-box { flex: 1; background: #F3F4F6; border-radius: 6px; padding: 10px 14px; border-left: 3px solid ${PRIMARY}; }
    .summary-box.green { border-left-color: ${SUCCESS}; }
    .summary-box.red { border-left-color: ${ERROR}; }
    .summary-box.amber { border-left-color: ${SECONDARY}; }
    .summary-label { font-size: 9px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px; }
    .summary-value { font-size: 18px; font-weight: bold; color: ${PRIMARY}; margin-top: 2px; }
    .summary-box.green .summary-value { color: ${SUCCESS}; }
    .summary-box.red .summary-value { color: ${ERROR}; }
    .summary-box.amber .summary-value { color: ${SECONDARY}; }
    table { width: 100%; border-collapse: collapse; margin-top: 4px; }
    thead tr { background: ${PRIMARY}; color: #fff; }
    thead th { padding: 8px 6px; text-align: left; font-size: 10px; font-weight: 600; border: 1px solid #2E5490; }
    tbody tr:nth-child(even) { background: #F9FAFB; }
    tbody tr:hover { background: #EFF6FF; }
    tbody td { padding: 7px 6px; border: 1px solid #E5E7EB; font-size: 10px; vertical-align: middle; }
    .badge { display: inline-block; padding: 2px 7px; border-radius: 10px; font-size: 9px; font-weight: 600; }
    .badge-upcoming { background: #FEF3C7; color: #92400E; }
    .badge-completed { background: #D1FAE5; color: #065F46; }
    .badge-cancelled { background: #FEE2E2; color: #991B1B; }
    .incentive { display: inline-block; background: #FEF3C7; color: #92400E; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 700; }
    .footer { margin-top: 20px; border-top: 1px solid #E5E7EB; padding-top: 10px; font-size: 9px; color: #9CA3AF; text-align: center; }
  </style>
`;

const badge = status => {
  const cls = {UPCOMING: 'upcoming', COMPLETED: 'completed', CANCELLED: 'cancelled'}[status] || 'upcoming';
  return `<span class="badge badge-${cls}">${status}</span>`;
};

export const exportDutyReportPDF = async (duties, filters = {}) => {
  if (!duties || duties.length === 0) {
    Alert.alert('No Data', 'Nothing to export. Load some duties first.');
    return;
  }

  try {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', {day: '2-digit', month: 'short', year: 'numeric'});

    const total = duties.length;
    const completed = duties.filter(d => d.status === 'COMPLETED').length;
    const upcoming = duties.filter(d => d.status === 'UPCOMING').length;
    const cancelled = duties.filter(d => d.status === 'CANCELLED').length;
    const incentiveTotal = duties.filter(d => ['BEFORE_OFFICE', 'AFTER_OFFICE'].includes(d.officeType)).length * 500;

    const filterNote = [
      filters.status ? `Status: ${filters.status}` : '',
      filters.airportId ? `Airport filtered` : '',
    ].filter(Boolean).join(' | ') || 'All duties';

    const rows = duties.map((d, i) => `
      <tr>
        <td>${d.srNo || i + 1}</td>
        <td><strong>${d.officerName || '—'}</strong></td>
        <td>${d.date || '—'}</td>
        <td>${d.airportName || '—'}</td>
        <td>${d.terminalName || '—'}</td>
        <td>${d.flightNo || '—'}</td>
        <td>${d.from || '—'} → ${d.to || '—'}</td>
        <td>${(d.officeType || '').replace('_', ' ')}</td>
        <td>${d.arrivalDeparture || '—'}</td>
        <td>${badge(d.status)}</td>
        <td>${['BEFORE_OFFICE', 'AFTER_OFFICE'].includes(d.officeType) ? '<span class="incentive">₹500</span>' : '—'}</td>
      </tr>`).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8">${baseStyles}</head>
      <body>
        <div class="header">
          <div>
            <div class="org-name">Airport Duty Management</div>
            <div class="org-sub">Income Tax Department — Airport Protocol</div>
          </div>
          <div class="report-meta">
            <div>Generated: ${dateStr}</div>
            <div>Filter: ${filterNote}</div>
          </div>
        </div>

        <div class="report-title">Duty Report</div>

        <div class="summary">
          <div class="summary-box"><div class="summary-label">Total</div><div class="summary-value">${total}</div></div>
          <div class="summary-box green"><div class="summary-label">Completed</div><div class="summary-value">${completed}</div></div>
          <div class="summary-box amber"><div class="summary-label">Upcoming</div><div class="summary-value">${upcoming}</div></div>
          <div class="summary-box red"><div class="summary-label">Cancelled</div><div class="summary-value">${cancelled}</div></div>
          <div class="summary-box amber"><div class="summary-label">Incentive</div><div class="summary-value">₹${incentiveTotal}</div></div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Subordinate</th>
              <th>Date</th>
              <th>Airport</th>
              <th>Terminal</th>
              <th>Flight No</th>
              <th>Route</th>
              <th>Type</th>
              <th>Arr/Dep</th>
              <th>Status</th>
              <th>Incentive</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>

        <div class="footer">Airport Duty Management System &nbsp;|&nbsp; Total Records: ${total} &nbsp;|&nbsp; ${dateStr}</div>
      </body>
      </html>`;

    const file = await RNHTMLtoPDF.convert({
      html,
      fileName: `DutyReport_${now.toISOString().slice(0, 10)}`,
      directory: 'Documents',
    });

    await Share.open({
      url: `file://${file.filePath}`,
      type: 'application/pdf',
      title: 'Duty Report PDF',
      failOnCancel: false,
    });
  } catch (e) {
    Alert.alert('Export Failed', e?.message || 'Could not generate PDF');
  }
};

export const exportSubordinateReportPDF = async (subordinates, filters = {}) => {
  if (!subordinates || subordinates.length === 0) {
    Alert.alert('No Data', 'Nothing to export.');
    return;
  }

  try {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', {day: '2-digit', month: 'short', year: 'numeric'});

    const filterNote = [
      filters.dateFrom ? `From: ${filters.dateFrom}` : '',
      filters.dateTo ? `To: ${filters.dateTo}` : '',
    ].filter(Boolean).join(' | ') || 'All periods';

    const rows = subordinates.map((item, i) => {
      const o = item.officer || {};
      return `
        <tr>
          <td>${i + 1}</td>
          <td><strong>${o.name || '—'}</strong></td>
          <td>${o.employeeId || '—'}</td>
          <td>${o.phone || '—'}</td>
          <td style="text-align:center">${item.totalDuties || 0}</td>
          <td style="text-align:center">${item.upcoming || 0}</td>
          <td style="text-align:center; color:${SUCCESS}; font-weight:bold">${item.completed || 0}</td>
          <td style="text-align:center; color:${ERROR}">${item.cancelled || 0}</td>
          <td style="text-align:center; color:#7C3AED">${item.beforeOffice || 0}</td>
          <td style="text-align:center; color:#7C3AED">${item.afterOffice || 0}</td>
          <td style="text-align:center; font-weight:bold; color:#92400E">₹${item.totalIncentive || 0}</td>
        </tr>`;
    }).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8">${baseStyles}</head>
      <body>
        <div class="header">
          <div>
            <div class="org-name">Airport Duty Management</div>
            <div class="org-sub">Income Tax Department — Airport Protocol</div>
          </div>
          <div class="report-meta">
            <div>Generated: ${dateStr}</div>
            <div>Period: ${filterNote}</div>
          </div>
        </div>

        <div class="report-title">Subordinate Summary Report</div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Employee ID</th>
              <th>Phone</th>
              <th>Total</th>
              <th>Upcoming</th>
              <th>Completed</th>
              <th>Cancelled</th>
              <th>Before Office</th>
              <th>After Office</th>
              <th>Total Incentive</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>

        <div class="footer">Airport Duty Management System &nbsp;|&nbsp; Total Subordinates: ${subordinates.length} &nbsp;|&nbsp; ${dateStr}</div>
      </body>
      </html>`;

    const file = await RNHTMLtoPDF.convert({
      html,
      fileName: `SubordinateReport_${now.toISOString().slice(0, 10)}`,
      directory: 'Documents',
    });

    await Share.open({
      url: `file://${file.filePath}`,
      type: 'application/pdf',
      title: 'Subordinate Report PDF',
      failOnCancel: false,
    });
  } catch (e) {
    Alert.alert('Export Failed', e?.message || 'Could not generate PDF');
  }
};
