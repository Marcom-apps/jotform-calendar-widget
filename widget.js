(function () {
  // Set timezone to NZ (Auckland)
  const timeZone = 'Pacific/Auckland';

  // Format a date as YYYY-MM-DD (for comparisons)
  function formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  // Get today's date in NZ time
  function getNowInNZ() {
    const now = new Date();
    const nzTime = new Date(now.toLocaleString('en-NZ', { timeZone }));
    return nzTime;
  }

  // Get number of working days to block
  function getBlockedWorkingDayCount() {
    const nzNow = getNowInNZ();
    const hour = nzNow.getHours();
    return hour < 8 ? 6 : 5;
  }

  // Get next N working days *including today*
  function getNextWorkingDays(count) {
    const today = getNowInNZ();
    let workingDays = [];
    let current = new Date(today);

    while (workingDays.length < count) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) {
        workingDays.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }

    return workingDays.map(formatDate);
  }

  // NZ public holidays (static + Matariki 2025–2029)
  const nzHolidays = [
    "01-01", "01-02", "02-06", "04-25", "06-01", "10-28", "12-25", "12-26",
    "2025-06-20", "2026-07-10", "2027-06-25", "2028-07-14", "2029-07-06"
  ];

  function getHolidayDates() {
    const currentYear = getNowInNZ().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear + i);
    let holidays = [];

    for (let year of years) {
      for (let h of nzHolidays) {
        if (h.length === 5) {
          holidays.push(`${year}-${h}`);
        } else if (h.startsWith(`${year}`)) {
          holidays.push(h);
        }
      }
    }
    return holidays;
  }

  // Disable rules
  function getDisableRules(blockedDates, minSelectableDateStr, publicHolidays) {
    return [
      function (date) {
        const ymd = formatDate(date);
        const day = date.getDay();

        if (day === 0 || day === 6) return true; // Weekend
        if (ymd < minSelectableDateStr) return true;
        if (blockedDates.includes(ymd)) return true;
        if (publicHolidays.includes(ymd)) return true;

        return false;
      }
    ];
  }

  // Run logic
  const blockCount = getBlockedWorkingDayCount();
  const blockedDates = getNextWorkingDays(blockCount);
  const minDateObj = new Date(blockedDates[blockedDates.length - 1]);
  minDateObj.setDate(minDateObj.getDate() + 1);
  const minSelectableDateStr = formatDate(minDateObj);
  const publicHolidays = getHolidayDates();

  // Init Flatpickr
  const calendarInput = document.getElementById("calendar");
  const calendar = flatpickr(calendarInput, {
    disable: getDisableRules(blockedDates, minSelectableDateStr, publicHolidays),
    dateFormat: "d-m-Y", // NZ format
    onChange: function (selectedDates, dateStr) {
      if (typeof JFCustomWidget !== "undefined") {
        // Send ISO format back (not display format)
        JFCustomWidget.sendData(formatDate(selectedDates[0]));
      }
    }
  });

  // Widget integration
  if (typeof JFCustomWidget !== "undefined") {
    JFCustomWidget.init({
      onSubmit: function () {
        const selected = calendarInput.value;
        JFCustomWidget.sendSubmit(selected);
      }
    });
  }
})();
