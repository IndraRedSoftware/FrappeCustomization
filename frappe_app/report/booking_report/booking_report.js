// Copyright (c) 2024, redsoft and contributors
// For license information, please see license.txt

frappe.query_reports["Booking Report"] = {
  onload: async function (report) {
    frappe.call({
      method: "frappe_hfhg.api.get_user_role",
      callback: function (r) {
        if (r.message) {
          if (r.message.role === "Executive") {
            let executive_filter = report.get_filter("executive");
            report.set_filter_value("executive", r.message.executive);
            executive_filter.df.read_only = 1;
            report.refresh();
            executive_filter.refresh();
          } else if (r.message.role === "Receptionist") {
            let center_filter = report.get_filter("center");
            report.set_filter_value("center", r.message.center);
            center_filter.df.read_only = 1;
            center_filter.refresh();
            report.refresh();
          }
        }
      },
    });
    const updateTotalAmount = function () {
      frappe.call({
        method:
          "frappe_hfhg.frappe_hfhg.report.booking_report.booking_report.execute",
        args: {
          filters: report.get_values(),
        },
        callback: function (r) {
          if (r.message) {
            let total_amount = r.message[2].total_amount;
            let booking_count = r.message[2].booking_count;
            report.page.wrapper.find(".total-amount-header").remove();
            report.page.wrapper.find(".booking-count-header").remove();

            let header_html = `<h5 class="total-amount-header" style="margin-left: 20px; display: flex; align-items: center;">Total Package: ${total_amount}</h5>
             <h5 class="booking-count-header" style="margin-left: 20px; display: flex; align-items: center;">
                        Booking Count: ${booking_count}
                    </h5>
            `;

            let filter_section = report.page.wrapper.find(".page-form");
            if (filter_section.length) {
              filter_section.css("display", "flex");
              filter_section.css("align-items", "center");
              filter_section.append(header_html);
            }
          }
        },
      });

      $(document).ready(function () {
        const breadcrumbContainer = $("#navbar-breadcrumbs");
        const breadcrumbExists =
          breadcrumbContainer.find('a[href="/app/costing/view/list"]').length >
          0;

        if (breadcrumbContainer.length && !breadcrumbExists) {
          const newBreadcrumb = $(
            '<li><a href="/app/costing/view/list">Booking</a></li>'
          );

          breadcrumbContainer.append(newBreadcrumb);
        }
      });
    };

    updateTotalAmount();

    report.filters.forEach(function (filter) {
      let original_on_change = filter.df.onchange;
      filter.df.onchange = function () {
        if (original_on_change) {
          original_on_change.apply(this, arguments);
        }
        updateTotalAmount();
      };
    });
    $(document).on("change", ".dt-filter.dt-input", function () {
      updateTotalAmount();
    });
  },
  refresh: function (report) {
    updateTotalAmount();
    frappe.call({
      method: "frappe_hfhg.api.get_user_role",
      callback: function (r) {
        if (r.message) {
          if (r.message.role === "Executive") {
            let executive_filter = report.get_filter("executive");
            report.set_filter_value("executive", r.message.executive);
            executive_filter.df.read_only = 1;
            report.refresh();
            executive_filter.refresh();
          } else if (r.message.role === "Receptionist") {
            let center_filter = report.get_filter("center");
            report.set_filter_value("center", r.message.center);
            center_filter.df.read_only = 1;
            center_filter.refresh();
            report.refresh();
          }
        }
      },
    });
  },
  filters: [
    {
      fieldname: "from_date",
      label: __("From Date"),
      fieldtype: "Date",
      reqd: 1,
      default: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    },
    {
      fieldname: "to_date",
      label: __("To Date"),
      fieldtype: "Date",
      reqd: 1,
      default: new Date(),
    },
    {
      fieldname: "center",
      label: __("Center"),
      fieldtype: "Link",
      options: "Center",
    },
    {
      fieldname: "source",
      label: __("Source"),
      fieldtype: "Data",
    },
    {
      fieldname: "executive",
      label: __("Executive"),
      fieldtype: "Link",
      options: "Executive",
    },
  ],
};
