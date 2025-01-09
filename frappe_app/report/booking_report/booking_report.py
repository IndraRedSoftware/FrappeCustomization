# Copyright (c) 2024, redsoft and contributors
# For license information, please see license.txt

import datetime
import frappe
from frappe import _

Filters = frappe._dict

@frappe.whitelist()
def execute(filters = None) -> tuple:
	if isinstance(filters, str):
		filters = frappe.parse_json(filters)
	if filters.to_date <= filters.from_date:
		frappe.throw(_('"From Date" can not be greater than or equal to "To Date"'))

	columns = get_columns()
	data = get_data(filters)
	total_amount = sum([row['package'] for row in data])
	booking_count = len(data)
	return columns, data, { "total_amount": total_amount,"booking_count": booking_count }


def get_columns() -> list[dict]:
	return [
		{
			"label": _("Month"),
			"fieldtype": "Data",
			"fieldname": "month",
			"width": 150,
		},
		{
			"label": _("Year"),
			"fieldtype": "Data",
			"fieldname": "year",
			"width": 150,
		},
		{
			"label": _("Lead Entered Date"),
			"fieldtype": "Date",
			"fieldname": "lead_date",
			"width": 150,
		},
		{
			"label": _("Booking Date"),
			"fieldtype": "Date",
			"fieldname": "booking_date",
			"width": 150,
		},
		{
			"label": _("Patient Name"),
			"fieldtype": "Data",
			"fieldname": "patient_name",
			"width": 150,
		},
		{
			"label": _("Phone No"),
			"fieldtype": "Data",
			"fieldname": "phone_no",
			"width": 150,
		},
		{
			"label": _("City"),
			"fieldtype": "Data",
			"fieldname": "city",
			"width": 150,
		},
		{
			"label": _("Center"),
			"fieldtype": "Data",
			"fieldname": "center",
			"width": 150,
		},
		{
			"label": _("Executive"),
			"fieldtype": "Data",
			"fieldname": "executive",
			"width": 150,
		},
		{
			"label": _("Grafts"),
			"fieldtype": "Data",
			"fieldname": "grafts",
			"width": 150,
		},
		{
			"label": _("Package"),
			"fieldtype": "Data",
			"fieldname": "package",
			"width": 150,
		},
		{
			"label": _("Surgery Date"),
			"fieldtype": "Date",
			"fieldname": "surgery_date",
			"width": 150,
		},
		{
			"label": _("Booking Amount"),
			"fieldtype": "Data",
			"fieldname": "booking_amount",
			"width": 150,
		},
		{
			"label": _("Booking GST"),
			"fieldtype": "Data",
			"fieldname": "booking_gst",
			"width": 150,
		},
		{
			"label": _("Pending Amount"),
			"fieldtype": "Data",
			"fieldname": "pending_amount",
			"width": 150,
		},
		{
			"label": _("Payment Mode"),
			"fieldtype": "Data",
			"fieldname": "payment_mode",
			"width": 150,
		},
		{
			"label": _("Payment In"),
			"fieldtype": "Data",
			"fieldname": "payment_in",
			"width": 150,
		},
		{
			"label": _("Source"),
			"fieldtype": "Data",
			"fieldname": "source",
			"width": 150,
		},
		{
			"label": _("Payment Status"),
			"fieldtype": "Data",
			"fieldname": "payment_status",
			"width": 150,
		},
		{
			"label": _("Assign By"),
			"fieldtype": "Data",
			"fieldname": "assign_by",
			"width": 150,
		},
		{
			"label": _("Lead Mode"),
			"fieldtype": "Data",
			"fieldname": "lead_mode",
			"width": 150,
		},
		{
			"label": _("Campaign Name"),
			"fieldtype": "Data",
			"fieldname": "campaign_name",
			"width": 150,
		},
	]

def get_data(filters) -> list[dict]:
	rows = []
	bookings = frappe.get_all("Costing", fields=["*"], filters={
		"booking_date": ["between", [filters.from_date, filters.to_date]],
		"status": "Booking"
	})
	user = frappe.session.user
	is_receptionist = frappe.db.exists("Receptionist", {'email': user})
	is_executive = frappe.db.exists("Executive", {'email': user})
	roles = frappe.get_roles()
	is_marketing_head = True if "Marketing Head" in roles else False

	if is_receptionist and not is_marketing_head:
		receptionist = frappe.db.get_value('Receptionist', {'email': user}, ['name'], as_dict=1)
		center = frappe.db.get_value('Center', {'receptionist': receptionist.name}, ['name'], as_dict=1)
		bookings = list(filter(lambda x: x.get("center") == center.name, bookings))

	elif is_executive and not is_marketing_head:
		executive = frappe.db.get_value('Executive', {'email': user}, ['name'], as_dict=1)
		bookings = list(filter(lambda x: x.get("executive") == executive.name, bookings))

	else:
		if filters.center:
			bookings = list(filter(lambda x: x.get("center") == filters.center, bookings))

		if filters.executive:
			bookings = list(filter(lambda x: x.get("executive") == filters.executive, bookings))

		if filters.source:
			bookings = list(filter(lambda x: filters.source in x.get("source", ""), bookings))
			
	for surgery in bookings:
		payment_mode = ""
		payment_in = ""
		booking_payment = None
		lead = frappe.get_doc("Lead", surgery.get("patient"), ["campaign_name"])
		booking_payment_exists = frappe.db.exists("Payment", {"payment_type": "Costing", "type": "Payment", "patient": surgery.get("patient")}, ["*"])
		if booking_payment_exists:
			booking_payment = frappe.get_doc("Payment", {"payment_type": "Costing", "type": "Payment", "patient": surgery.get("patient")}, ["*"])
			if booking_payment:
				if booking_payment.get("with_gst_amount") and len(booking_payment.get("gst_payment_entries")) > 0:
					payment_mode = booking_payment.get("gst_payment_entries")[0].get("method")
					payment_in = booking_payment.get("gst_payment_entries")[0].get("payment_in")
				elif booking_payment.get("without_gst_amount") and len(booking_payment.get("payment_entries")) > 0:
					payment_mode = booking_payment.get("payment_entries")[0].get("method")
					payment_in = booking_payment.get("payment_entries")[0].get("payment_in")
			
		row = {
			"month": surgery.get("booking_date").strftime("%B") if surgery.get("booking_date") else "",
			"year": surgery.get("booking_date").strftime("%Y") if surgery.get("booking_date") else "",
			"surgery_date": surgery.get("surgery_date"),
			"source": surgery.get("lead_source"),
			"center": surgery.get("center"),
			"patient_name": f'<strong><a href="/app/lead/{surgery.get("patient")}"style="color: inherit;">{lead.get("name")}</a></strong>',
			"phone_no": surgery.get("contact_number"),
			"city": surgery.get("city"),
			"executive": surgery.get("executive"),
			"grafts": surgery.get("grafts"),
			"package": surgery.get("total_amount"),
			"pending_amount": surgery.get("pending_amount"),
			"booking_amount": surgery.get("amount_paid"),
			"booking_gst": booking_payment.get("with_gst_amount") if booking_payment else 0,
			"payment_mode": payment_mode,
			"payment_in": payment_in,
			"booking_date": surgery.get("booking_date"),
			"lead_date": surgery.get("lead_created_date"),
			"payment_status": surgery.get("status"),
			"assign_by": surgery.get("assign_by"),
			"lead_mode": surgery.get("lead_mode"),
			"campaign_name": lead.get("campaign_name")

		}
		rows.append(row)

	return rows
