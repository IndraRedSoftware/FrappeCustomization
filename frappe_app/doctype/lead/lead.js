frappe.ui.form.on("Lead", {
  refresh(frm) {
    if (!frm.is_new()) {
      frm.add_custom_button("Show Conversations", function () {
        frappe.call({
          method: "frappe.client.get_value",
          args: {
            doctype: "User",
            fieldname: "desk_theme",
            filters: {
              name: frappe.session.user,
            },
          },
          callback: function (response) {
            let desk_theme = response.message.desk_theme || "Light"; // Default to Light if theme not set

            // Define colors based on theme
            const isDarkTheme = desk_theme.toLowerCase() === "dark";
            const modalBackgroundColor = isDarkTheme ? "#171717" : "#ffffff";
            const textColor = isDarkTheme ? "#f5f5f5" : "#000000";
            const buttonBackgroundColor = isDarkTheme ? "#444" : "light-gray";
            const closeButtonColor = isDarkTheme ? "#ff6b6b" : "#d32f2f";

            // Create modal HTML with theme-based styles
            const modalHTML = `
                    <div id="customModal" class="modal" style="display: flex; align-items: center; justify-content: center; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: ${
                      isDarkTheme ? "#333" : "#F5F5F5"
                    }; z-index: 9999;">
                        <div class="modal-content" style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); padding: 5px; width: 90%; max-width: 1600px; height:90vh; max-height: 100vh; overflow: hidden; background-color: ${modalBackgroundColor};">
                            <span class="close-button" id="closeModal" style="cursor: pointer; color: ${closeButtonColor}; font-size: 24px; font-weight: bold; position: absolute; top: 15px; right: 15px; z-index:999;">&times;</span>
                            
                            <div class="modal-body" style="display: flex; gap: 20px; justify-content: space-between; max-height: 90%; position: relative;">
                                <div class="table-container" style="flex:1; background: ${modalBackgroundColor}; color: ${textColor}; border-radius: 8px; padding: 10px;">
                                    <h3 style="color: ${
                                      isDarkTheme ? "#c7c7c7" : "#525252"
                                    }; font-weight: 500; font-size: 13px; margin-bottom: 6px;">Reminders</h3>
                                    <div style="max-height: 85%; overflow-y: auto; border-radius: 8px ; border: 1px solid ${
                                      isDarkTheme ? "#232323" : "#f3f3f3"
                                    };">
                                        <table id="remindersTable" class="data-table" style="width: 100%; border-collapse: separate; border-spacing: 0; font-size: 13px; color: ${
                                          isDarkTheme ? "#7c7c7c" : "#7c7c7c"
                                        }; bordercolor: #232323; ">
                                            <thead >
                                                <tr style="background-color: ${
                                                  isDarkTheme
                                                    ? "#232323"
                                                    : "#f3f3f3"
                                                }; ">
                                                    <th style="border: 1px solid ${
                                                      isDarkTheme
                                                        ? "#232323"
                                                        : "#ededed"
                                                    }; padding: 6px 8px; width: 25%; font-weight: 500;">Date<span style="color: red;">*</span></th>
                                                    <th style="border: 1px solid ${
                                                      isDarkTheme
                                                        ? "#232323"
                                                        : "#ededed"
                                                    }; padding: 6px 8px; width: 60%; max-width: 60%; font-weight: 500;">Description<span style="color: red;">*</span></th>
                                                    <th style="border: 1px solid ${
                                                      isDarkTheme
                                                        ? "#232323"
                                                        : "#ededed"
                                                    }; padding: 6px 8px; width: 10%; font-weight: 500;">Status<span style="color: red;">*</span></th>
                                                </tr>
                                            </thead>
                                            <tbody style="color: ${
                                              isDarkTheme
                                                ? "#c7c7c7"
                                                : "#525252"
                                            }; font-weight:600;"></tbody>
                                        </table>
                                    </div>
                                    <button id="addReminder" style="margin-top: 10px; background-color: ${
                                      isDarkTheme ? "#232323" : "#f3f3f3"
                                    }; color: ${
              isDarkTheme ? "#f8f8f8" : "#383838"
            }; padding: 4px 8px; font-size:14px; border: none; border-radius: 10px; cursor: pointer;">Add Row</button>
                                </div>
                                <div class="table-container" style="flex:1; background: ${modalBackgroundColor}; color: ${textColor}; border-radius: 8px; padding: 15px;">
                                    <h3 style="color: ${
                                      isDarkTheme ? "#c7c7c7" : "#525252"
                                    }; font-weight: 500; font-size: 13px; margin-bottom: 6px;">Conversations</h3>
                                    <div style="max-height: 85%; overflow-y: auto; border-radius: 8px ; border: 1px solid ${
                                      isDarkTheme ? "#232323" : "#f3f3f3"
                                    };">
                                        <table id="conversationsTable" class="data-table" style="width: 100%; border-collapse: separate; border-spacing: 0; font-size: 13px; color: ${
                                          isDarkTheme ? "#7c7c7c" : "#7c7c7c"
                                        };">
                                            <thead>
                                                <tr style="background-color: ${
                                                  isDarkTheme
                                                    ? "#232323"
                                                    : "#f3f3f3"
                                                };">
                                                    <th style="border: 1px solid ${
                                                      isDarkTheme
                                                        ? "#232323"
                                                        : "#ededed"
                                                    }; padding: 6px 8px; width: 25%; font-weight: 500;">Date<span style="color: red;">*</span></th>
                                                    <th style="border: 1px solid ${
                                                      isDarkTheme
                                                        ? "#232323"
                                                        : "#ededed"
                                                    }; padding: 6px 8px; width: 70%; max-width: 70%; font-weight: 500;">Description<span style="color: red;">*</span></th>
                                                    
                                                </tr>
                                            </thead>
                                            <tbody style="color: ${
                                              isDarkTheme
                                                ? "#c7c7c7"
                                                : "#525252"
                                            }; font-weight: 600;"></tbody>
                                        </table>
                                    </div>
                                    <button id="addConversation" style="margin-top: 10px; background-color: ${
                                      isDarkTheme ? "#232323" : "#f3f3f3"
                                    }; color: ${
              isDarkTheme ? "#f8f8f8" : "#383838"
            }; padding: 4px 8px; font-size:14px; border: none; border-radius: 10px; cursor: pointer;">Add Row</button>
                                </div>
                            </div>
  
                            <div style="display: block; width: 200px; position: absolute; bottom: 20px; right: 110px;  font-size: 13px; border: none; ">
                <label for="leadStatus" style="font-weight: 500; font-size: 13px; color: ${
                  isDarkTheme ? "#c7c7c7" : "#525252"
                };">Status</label>
                <select id="leadStatus" style="width: 100%; padding: 8px; border-radius: 8px; outline:none; border:none; background-color: ${
                  isDarkTheme ? "#232323" : "#f3f3f3"
                };">
                    <option value="${frm.doc.status}">${frm.doc.status}</option>
                    <option value="New Lead">New Lead</option>
                    <option value="Duplicate Lead">Duplicate Lead</option>
                    <option value="Fake Lead">Fake Lead</option>
                    <option value="Invalid Number">Invalid Number</option>
                    <option value="Not Connected">Not Connected</option>
                    <option value="Not Interested">Not Interested</option>
                    <option value="Callback">Callback</option>
                    <option value="Connected">Connected</option>
                    <option value="CS Followup">CS Followup</option>
                    <option value="CS Lined Up">CS Lined Up</option>
                    <option value="HT CS Done">HT CS Done</option>
                    <option value="Budget Issue">Budget Issue</option>
                    <option value="Costing Done">Costing Done</option>
                    <option value="Hairfall PT">Hairfall PT</option>
                    <option value="Medi/PRP">Medi/PRP</option>
                    <option value="Booked">Booked</option>
                    <option value="Date Given">Date Given</option>
                    <option value="HT Postpone">HT Postpone</option>
                    <option value="BHT Followup">BHT Followup</option>
                    <option value="HT Done">HT Done</option>
                    <option value="HT Not Possible">HT Not Possible</option>
                    <option value="Alopecia Case">Alopecia Case</option>
                    <option value="Loan/EMI">Loan/EMI</option>
                    <option value="Beard HT">Beard HT</option>
                    <option value="2nd session">2nd session</option>
                    <option value="HT Prospect">HT Prospect</option>
                </select>
            </div>
            
                            <button id="saveChanges" style="display: block; width: 60px; position: absolute; bottom: 20px; right: 40px; background-color: ${
                              isDarkTheme ? "white" : "#171717"
                            }; color: ${
              isDarkTheme ? "black" : "#fff"
            }; padding: 4px 5px; font-size: 14px; border: none; border-radius: 10px; cursor: pointer;">
                                Save 
                            </button>
                        </div>
                    </div>
                `;

            document.body.insertAdjacentHTML("beforeend", modalHTML);

            document
              .getElementById("closeModal")
              .addEventListener("click", function () {
                document.getElementById("customModal").remove(); // Hides the modal
              });

            const populateTable = (tableBody, items, isReminders = false) => {
              items.sort((a, b) => new Date(b.date) - new Date(a.date));

              tableBody.innerHTML = "";
              items.forEach((item, index) => {
                const formattedDate = item.date ? formatDate(item.date) : ""; // Format the date for display
                const row = `<tr data-index="${index}">
                                  <td class="${
                                    isReminders ? "editable" : ""
                                  }" data-field="date" style="border: 1px solid ${
                  isDarkTheme ? "#232323" : "#ededed"
                }; padding: 10px 10px;">${formattedDate}</td>
                                  <td class="editable" data-field="description" style="border: 1px solid ${
                                    isDarkTheme ? "#232323" : "#ededed"
                                  }; padding: 10px 8px; word-break: break-all; white-space: normal;">${
                  item.description || ""
                }</td>
                                  ${
                                    isReminders
                                      ? `<td class="editable" data-field="status" style="border: 1px solid ${
                                          isDarkTheme ? "#232323" : "#ededed"
                                        }; padding: 10px 8px;">${
                                          item.status || ""
                                        }</td>`
                                      : ""
                                  }
                                  </td>
                              </tr>`;
                tableBody.innerHTML += row;
              });
            };

            function formatDate(dateString) {
              const [year, month, day] = dateString.split("-");
              return `${day}-${month}-${year}`; // Convert to dd-mm-yyyy
            }

            const updateTables = () => {
              populateTable(
                document.querySelector("#conversationsTable tbody"),
                frm.doc.conversations || []
              );
              populateTable(
                document.querySelector("#remindersTable tbody"),
                frm.doc.reminders || [],
                true
              );
              makeCellsEditable();
              attachDeleteRowEvent();
            };

            updateTables();

            function makeCellsEditable() {
              const editableCells = document.querySelectorAll(".editable");

              editableCells.forEach((cell) => {
                cell.addEventListener("click", function () {
                  if (this.querySelector("input, select, textarea")) return;

                  const field = this.dataset.field;
                  const originalValue = this.innerText.trim();
                  let input;

                  if (field === "date") {
                    input = document.createElement("input");
                    input.type = "date";
                    input.value = originalValue
                      ? formatToInputDate(originalValue)
                      : ""; // Set value in yyyy-mm-dd format
                    input.style.width = "100%";
                    if (this.closest("table").id === "remindersTable") {
                      const today = new Date().toISOString().split("T")[0]; // Get current date in yyyy-mm-dd format
                      input.setAttribute("min", today); // Set min attribute to today
                    }
                  } else if (field === "status") {
                    input = document.createElement("select");
                    const openOption = new Option("Open", "Open");
                    const closeOption = new Option("Close", "Close");
                    input.add(openOption);
                    input.add(closeOption);
                    input.value = originalValue || "Open";
                  } else {
                    input = document.createElement("textarea");
                    input.value = originalValue;
                    input.style.width = "100%";
                    input.rows = field === "description" ? 4 : 1;
                  }

                  this.innerHTML = "";
                  this.appendChild(input);
                  input.focus();

                  // Save changes on blur
                  input.addEventListener("blur", () => {
                    const rowIndex = this.parentElement.dataset.index;
                    const items = this.closest("#conversationsTable")
                      ? frm.doc.conversations
                      : frm.doc.reminders;

                    if (field === "date") {
                      const dateValue = input.value || originalValue;
                      items[rowIndex][field] = dateValue; // Date is already in yyyy-mm-dd format from the input
                    } else {
                      items[rowIndex][field] = input.value || originalValue;
                    }

                    this.innerText = items[rowIndex][field];
                    frm.refresh_field(
                      this.closest("#conversationsTable")
                        ? "conversations"
                        : "reminders"
                    );
                    frm.dirty();
                  });

                  // Save changes on Enter key
                  input.addEventListener("keypress", (e) => {
                    if (e.key === "Enter") {
                      input.blur();
                    }
                  });
                });
              });
            }

            function formatToInputDate(dateString) {
              const [day, month, year] = dateString.split("-");
              return `${year}-${month}-${day}`; // Convert to yyyy-mm-dd for input
            }

            function attachDeleteRowEvent() {
              const deleteButtons = document.querySelectorAll(".delete-row");

              deleteButtons.forEach((button) => {
                button.addEventListener("click", function () {
                  const row = this.closest("tr"); // Get the closest row (tr)
                  const index = row.dataset.index; // Get the index from the row's data-index
                  const tableType = this.closest("table").id;
                  const tableItems =
                    tableType === "conversationsTable"
                      ? frm.doc.conversations
                      : frm.doc.reminders;

                  tableItems.splice(index, 1); // Remove the selected item from the array
                  frm.refresh_field(
                    tableType === "conversationsTable"
                      ? "conversations"
                      : "reminders"
                  );
                  updateTables(); // Refresh table display
                  frm.dirty();
                });
              });
            }

            document.getElementById("addConversation").onclick = function () {
              const newConversation = frm.add_child("conversations");
              const today = new Date();
              const formattedDate = today.toISOString().split("T")[0]; // Format date as yyyy-mm-dd
              newConversation.date = formattedDate;
              newConversation.description = " ";
              frm.doc.conversations.pop();
              frm.doc.conversations.unshift(newConversation);
              frm.refresh_field("conversations");
              updateTables();
            };

            document.getElementById("addReminder").onclick = function () {
              const allClosed = frm.doc.reminders.every(
                (reminder) => reminder.status === "Close"
              );
              if (!allClosed) {
                alert(
                  "You can only add a new reminder when all existing reminders are closed."
                );
                return;
              }
              const newReminder = frm.add_child("reminders");
              newReminder.date = "";
              newReminder.description = " ";
              newReminder.status = "Open"; // Set default status to "Open"
              newReminder.executive = frm.doc.executive;
              frm.doc.reminders.pop();
              frm.doc.reminders.unshift(newReminder);
              frm.refresh_field("reminders");
              updateTables();
            };

            document.getElementById("saveChanges").onclick = function () {
              // Validate required fields in each conversation row
              const selectedStatus =
                document.getElementById("leadStatus").value;
              console.log(selectedStatus);
              let isValid = true;
              frm.doc.conversations.forEach((conversation, index) => {
                if (!conversation.date || !conversation.description.trim()) {
                  isValid = false;
                  alert(
                    `Date and Description are required in row ${index + 1}.`
                  );
                }
              });
              frm.doc.reminders.forEach((reminder, index) => {
                if (!reminder.date || !reminder.description.trim()) {
                  isValid = false;
                  alert(
                    `Date and Description are required in Reminder row ${
                      index + 1
                    }.`
                  );
                }
              });

              // Save only if all required fields are filled
              if (isValid) {
                frm.doc["status"] = selectedStatus;

                frm.dirty();
                frm.save();
                document.getElementById("customModal").remove();
              }
            };

            document.getElementById("customModal").onclick = function (event) {
              if (event.target === this) {
                document.getElementById("customModal").remove();
              }
            };
          },
        });
      });
    }
  },
});
