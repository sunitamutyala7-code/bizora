const SUPABASE_URL = "https://fizwyiscqehjuybqijgv.supabase.co";

const SUPABASE_KEY = "sb_publishable_JXtYAnwwIJEiIA9oZPKXnA_oRwo6DVq";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

console.log("Bizora Supabase connected");
const signupForm = document.getElementById("signupForm");

if (signupForm) {

  signupForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    console.log("Signup button clicked");

    const fullName =
      document.getElementById("fullName").value.trim();

    const email =
      document.getElementById("email").value.trim();

    const password =
      document.getElementById("password").value;

    const businessName =
      document.getElementById("businessName").value.trim();

    if (!fullName || !email || !password || !businessName) {

      alert("Please fill in all fields.");

      return;
    }

    if (password.length < 6) {

      alert("Password must be at least 6 characters.");

      return;
    }

    console.log("Creating Bizora account...");

    const button =
      signupForm.querySelector("button[type='submit']");

    button.disabled = true;

    button.textContent = "Creating account...";

    const result =
      await supabaseClient.auth.signUp({

        email: email,

        password: password,

        options: {

          data: {

            full_name: fullName,

            business_name: businessName

          }

        }

      });

    console.log("Supabase signup result:", result);

    if (result.error) {

      alert(
        "Signup failed:\n\n" +
        result.error.message
      );

      button.disabled = false;

      button.textContent =
        "Create Account →";

      return;
    }

    alert(
      "Account created successfully!\n\n" +
      "Please check your email and confirm your account."
    );

    window.location.href = "login.html";

  });

}
// LOGIN

const loginForm = document.getElementById("loginForm");

if (loginForm) {

  console.log("Login form found");

  loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    console.log("Login button clicked");

    const email =
      document.getElementById("loginEmail").value.trim();

    const password =
      document.getElementById("loginPassword").value;

    if (!email || !password) {

      alert("Please enter your email and password.");

      return;
    }

    const button =
      loginForm.querySelector("button[type='submit']");

    button.disabled = true;

    button.textContent = "Logging in...";

    console.log("Sending login request...");

    const result =
      await supabaseClient.auth.signInWithPassword({

        email: email,

        password: password

      });

    console.log("LOGIN ERROR:", result.error);

    if (result.error) {

      alert(
        "Login failed:\n\n" +
        result.error.message
      );

      button.disabled = false;

      button.textContent = "Log In →";

      return;
    }

    console.log("LOGIN SUCCESSFUL");

    window.location.href = "dashboard.html";

  });

}
console.log("Dashboard script loaded");
// ==========================================
// LOAD DASHBOARD USER
// ==========================================

async function loadDashboardUser() {

  const welcomeName =
    document.getElementById("welcomeName");

  const businessName =
    document.getElementById("businessName");

  if (!welcomeName) {
    return;
  }

  const result =
    await supabaseClient.auth.getUser();

  if (result.error) {

    console.error(
      "User error:",
      result.error
    );

    return;
  }

  const user =
    result.data.user;

  if (!user) {

    window.location.href =
      "login.html";

    return;
  }

  const metadata =
    user.user_metadata || {};

  const fullName =
    metadata.full_name || "there";

  const business =
    metadata.business_name || "Your business";

  welcomeName.textContent =
    "Welcome back, " +
    fullName +
    " 👋";

  if (businessName) {

    businessName.textContent =
      business;
  }

  console.log(
    "Dashboard loaded for:",
    fullName,
    business
  );
}

loadDashboardUser();
// ==========================================
// BIZORA CUSTOMERS
// ==========================================

let allCustomers = [];

let editingCustomerId = null;


// ==========================================
// OPEN ADD CUSTOMER
// ==========================================

function openAddCustomerForm() {

  const modal =
    document.getElementById(
      "customerAddModal"
    );

  if (modal) {

    modal.style.display = "flex";

  }

}


// ==========================================
// CLOSE ADD CUSTOMER
// ==========================================

function closeAddCustomerForm() {

  const modal =
    document.getElementById(
      "customerAddModal"
    );

  if (modal) {

    modal.style.display = "none";

  }

}


// ==========================================
// LOAD CUSTOMERS
// ==========================================

async function loadCustomers() {

  const list =
    document.getElementById(
      "customersList"
    );

  if (!list) return;


  const result =
    await supabaseClient
      .from("customers")
      .select("*")
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (result.error) {

    console.error(
      "Customer loading error:",
      result.error
    );

    list.innerHTML =
      "<p>Unable to load customers.</p>";

    return;

  }


  allCustomers =
    result.data || [];


  displayCustomers(
    allCustomers
  );


  const count =
    document.getElementById(
      "customerCount"
    );


  if (count) {

    count.textContent =
      allCustomers.length +
      " customer" +
      (
        allCustomers.length === 1
          ? ""
          : "s"
      );

  }

}


// ==========================================
// DISPLAY CUSTOMERS
// ==========================================

function displayCustomers(
  customers
) {

  const list =
    document.getElementById(
      "customersList"
    );


  if (!list) return;


  if (customers.length === 0) {

    list.innerHTML = `
      <div style="
        text-align:center;
        padding:40px;
      ">
        <h3>No customers yet</h3>
        <p>Add your first customer.</p>
      </div>
    `;

    return;

  }


  list.innerHTML =
    customers.map(
      customer => {

        const initial =
          (
            customer.name ||
            "C"
          )
          .charAt(0)
          .toUpperCase();


        return `

          <div
            class="customer-row"
            style="
              display:flex;
              align-items:center;
              gap:15px;
            "
          >

            <div
              class="customer-avatar"
            >
              ${initial}
            </div>


            <div
              style="
                flex:1;
              "
            >

              <strong>
                ${customer.name}
              </strong>

              <span>
                ${customer.email || "No email"}
              </span>

              <span>
                ${customer.phone || "No phone"}
              </span>

            </div>


            <div
              style="
                display:flex;
                gap:8px;
              "
            >

              <button
                type="button"
                class="btn"
                onclick="
                  editCustomer('${customer.id}')
                "
              >
                Edit
              </button>


              <button
                type="button"
                class="btn"
                onclick="
                  deleteCustomer('${customer.id}')
                "
              >
                Delete
              </button>

            </div>

          </div>

        `;

      }
    )
    .join("");

}


// ==========================================
// SEARCH CUSTOMERS
// ==========================================

function searchCustomers() {

  const input =
    document.getElementById(
      "customerSearch"
    );


  if (!input) return;


  const search =
    input.value
      .toLowerCase()
      .trim();


  const filtered =
    allCustomers.filter(
      customer => {

        return (

          (customer.name || "")
            .toLowerCase()
            .includes(search)

          ||

          (customer.email || "")
            .toLowerCase()
            .includes(search)

          ||

          (customer.phone || "")
            .toLowerCase()
            .includes(search)

        );

      }
    );


  displayCustomers(
    filtered
  );

}


// ==========================================
// ADD CUSTOMER
// ==========================================

const customerForm =
  document.getElementById(
    "customerForm"
  );


if (customerForm) {

  customerForm.addEventListener(
    "submit",
    async function(event) {

      event.preventDefault();


      const userResult =
        await supabaseClient.auth.getUser();


      if (
        userResult.error ||
        !userResult.data.user
      ) {

        alert(
          "Please log in again."
        );

        window.location.href =
          "login.html";

        return;

      }


      const user =
        userResult.data.user;


      const name =
        document
          .getElementById(
            "customerName"
          )
          .value
          .trim();


      const email =
        document
          .getElementById(
            "customerEmail"
          )
          .value
          .trim();


      const phone =
        document
          .getElementById(
            "customerPhone"
          )
          .value
          .trim();


      if (!name) {

        alert(
          "Customer name is required."
        );

        return;

      }


      const result =
        await supabaseClient
          .from("customers")
          .insert({

            user_id:
              user.id,

            name:
              name,

            email:
              email || null,

            phone:
              phone || null

          });


      if (result.error) {

        console.error(
          "Customer insert error:",
          result.error
        );

        alert(
          "Could not add customer:\n\n" +
          result.error.message
        );

        return;

      }


      customerForm.reset();

      closeAddCustomerForm();


      await loadCustomers();


      alert(
        "Customer added successfully!"
      );

    }
  );

}


// ==========================================
// EDIT CUSTOMER
// ==========================================

async function editCustomer(
  customerId
) {

  const result =
    await supabaseClient
      .from("customers")
      .select("*")
      .eq(
        "id",
        customerId
      )
      .single();


  if (result.error) {

    console.error(
      "Customer loading error:",
      result.error
    );

    alert(
      "Unable to load customer."
    );

    return;

  }


  const customer =
    result.data;


  editingCustomerId =
    customerId;


  document.getElementById(
    "editCustomerName"
  ).value =
    customer.name || "";


  document.getElementById(
    "editCustomerEmail"
  ).value =
    customer.email || "";


  document.getElementById(
    "editCustomerPhone"
  ).value =
    customer.phone || "";


  const modal =
    document.getElementById(
      "customerEditModal"
    );


  if (modal) {

    modal.style.display =
      "flex";

  }

}


// ==========================================
// CLOSE EDIT CUSTOMER
// ==========================================

function closeCustomerEditForm() {

  const modal =
    document.getElementById(
      "customerEditModal"
    );


  if (modal) {

    modal.style.display =
      "none";

  }


  editingCustomerId =
    null;

}


// ==========================================
// UPDATE CUSTOMER
// ==========================================

const customerEditForm =
  document.getElementById(
    "customerEditForm"
  );


if (customerEditForm) {

  customerEditForm.addEventListener(
    "submit",
    async function(event) {

      event.preventDefault();


      if (!editingCustomerId) {

        return;

      }


      const name =
        document
          .getElementById(
            "editCustomerName"
          )
          .value
          .trim();


      const email =
        document
          .getElementById(
            "editCustomerEmail"
          )
          .value
          .trim();


      const phone =
        document
          .getElementById(
            "editCustomerPhone"
          )
          .value
          .trim();


      if (!name) {

        alert(
          "Customer name is required."
        );

        return;

      }


      const result =
        await supabaseClient
          .from("customers")
          .update({

            name:
              name,

            email:
              email || null,

            phone:
              phone || null

          })
          .eq(
            "id",
            editingCustomerId
          );


      if (result.error) {

        console.error(
          "Customer update error:",
          result.error
        );

        alert(
          "Could not update customer:\n\n" +
          result.error.message
        );

        return;

      }


      closeCustomerEditForm();


      await loadCustomers();


      alert(
        "Customer updated successfully!"
      );

    }
  );

}


// ==========================================
// DELETE CUSTOMER
// ==========================================

async function deleteCustomer(
  customerId
) {

  const confirmed =
    confirm(
      "Are you sure you want to delete this customer?"
    );


  if (!confirmed) return;


  const result =
    await supabaseClient
      .from("customers")
      .delete()
      .eq(
        "id",
        customerId
      );


  if (result.error) {

    console.error(
      "Customer delete error:",
      result.error
    );

    alert(
      "Could not delete customer:\n\n" +
      result.error.message
    );

    return;

  }


  await loadCustomers();


  alert(
    "Customer deleted successfully!"
  );

}


// ==========================================
// LOAD CUSTOMERS WHEN PAGE OPENS
// ==========================================

if (
  document.getElementById(
    "customersList"
  )
) {

  loadCustomers();

}

// ==========================================
// BIZORA APPOINTMENTS
// ==========================================

let allAppointments = [];
let editingAppointmentId = null;


// ==========================================
// OPEN NEW APPOINTMENT
// ==========================================

function openAppointmentForm() {

  // IMPORTANT: New appointment = no editing ID
  editingAppointmentId = null;

  const form =
    document.getElementById("appointmentForm");

  const modal =
    document.getElementById("appointmentModal");

  // Clear all previous appointment data
  if (form) {
    form.reset();
  }

  // Set NEW mode
  const title =
    document.getElementById("appointmentModalTitle");

  const description =
    document.getElementById("appointmentModalDescription");

  const button =
    document.getElementById("appointmentSubmitButton");

  if (title) {
    title.textContent = "New Appointment";
  }

  if (description) {
    description.textContent =
      "Schedule an appointment for a customer.";
  }

  if (button) {
    button.textContent = "Save Appointment";
  }

  // Open modal
  if (modal) {
    modal.style.display = "flex";
  }

}

// ==========================================
// CLOSE APPOINTMENT FORM
// ==========================================
window.closeAppointmentForm = function () {

  const modal =
    document.getElementById("appointmentModal");

  if (modal) {
    modal.style.display = "none";
  }

  editingAppointmentId = null;

};



// ==========================================
// LOAD APPOINTMENTS
// ==========================================

async function loadAppointments() {

  const list =
    document.getElementById("appointmentsList");

  if (!list) return;


  const result =
    await supabaseClient
      .from("appointments")
      .select("*")
      .order("appointment_date", {
        ascending: true
      })
      .order("appointment_time", {
        ascending: true
      });


  if (result.error) {

    console.error(
      "Appointment loading error:",
      result.error
    );

    list.innerHTML =
      "<p>Unable to load appointments.</p>";

    return;
  }


  allAppointments =
    result.data || [];


  displayAppointments(
    allAppointments
  );


  const count =
    document.getElementById(
      "appointmentCount"
    );

  if (count) {

    count.textContent =
      allAppointments.length +
      " appointment" +
      (
        allAppointments.length === 1
          ? ""
          : "s"
      );

  }

}


// ==========================================
// DISPLAY APPOINTMENTS
// ==========================================

function displayAppointments(
  appointments
) {

  const list =
    document.getElementById(
      "appointmentsList"
    );

  if (!list) return;


  if (appointments.length === 0) {

    list.innerHTML = `
      <div style="
        text-align:center;
        padding:40px;
      ">
        <h3>No appointments yet</h3>
        <p>Create your first appointment.</p>
      </div>
    `;

    return;
  }


  list.innerHTML =
    appointments.map(
      appointment => {

        const initial =
          (
            appointment.customer_name ||
            "C"
          )
          .charAt(0)
          .toUpperCase();


        return `

          <div
            class="appointment"
            style="
              display:flex;
              align-items:center;
              gap:15px;
            "
          >

            <div class="appointment-avatar">
              ${initial}
            </div>


            <div
              class="appointment-info"
              style="flex:1;"
            >

              <strong>
                ${appointment.customer_name}
              </strong>

              <span>
                ${appointment.service}
              </span>

              <span>
                ${appointment.appointment_date}
                ·
                ${appointment.appointment_time}
              </span>

            </div>


            <span
              class="appointment-status
              ${
                appointment.status === "Pending"
                  ? "pending"
                  : ""
              }"
            >
              ${appointment.status}
            </span>


            <div
              style="
                display:flex;
                gap:8px;
              "
            >

              <button
                type="button"
                class="btn"
                onclick="
                  editAppointment('${appointment.id}')
                "
              >
                Edit
              </button>


              <button
                type="button"
                class="btn"
                onclick="
                  deleteAppointment('${appointment.id}')
                "
              >
                Delete
              </button>

            </div>

          </div>

        `;

      }
    )
    .join("");

}


// ==========================================
// SEARCH APPOINTMENTS
// ==========================================

function searchAppointments() {

  const input =
    document.getElementById(
      "appointmentSearch"
    );

  if (!input) return;


  const search =
    input.value
      .toLowerCase()
      .trim();


  const filtered =
    allAppointments.filter(
      appointment => {

        return (

          (appointment.customer_name || "")
            .toLowerCase()
            .includes(search)

          ||

          (appointment.service || "")
            .toLowerCase()
            .includes(search)

          ||

          (appointment.status || "")
            .toLowerCase()
            .includes(search)

          ||

          (appointment.appointment_date || "")
            .includes(search)

        );

      }
    );


  displayAppointments(
    filtered
  );

}


// ==========================================
// ADD / UPDATE APPOINTMENT
// ==========================================

const appointmentForm =
  document.getElementById(
    "appointmentForm"
  );


if (appointmentForm) {

  appointmentForm.addEventListener(
    "submit",
    async function(event) {

      event.preventDefault();


      const userResult =
        await supabaseClient.auth.getUser();


      if (
        userResult.error ||
        !userResult.data.user
      ) {

        alert(
          "Please log in again."
        );

        window.location.href =
          "login.html";

        return;
      }


      const user =
        userResult.data.user;


      const customerSelect =
  document.getElementById(
    "appointmentCustomer"
  );

const customerId =
  customerSelect.value;

const customerName =
  customerSelect.options[
    customerSelect.selectedIndex
  ].textContent.trim();


      const service =
        document
          .getElementById(
            "appointmentService"
          )
          .value
          .trim();


      const appointmentDate =
        document
          .getElementById(
            "appointmentDate"
          )
          .value;


      const appointmentTime =
        document
          .getElementById(
            "appointmentTime"
          )
          .value;


      const status =
        document
          .getElementById(
            "appointmentStatus"
          )
          .value;


      if (
        !customerName ||
        !service ||
        !appointmentDate ||
        !appointmentTime
      ) {

        alert(
          "Please fill in all required fields."
        );

        return;
      }


      let result;


      // UPDATE
      if (editingAppointmentId) {

        result =
          await supabaseClient
            .from("appointments")
            .update({

              customer_name:
                customerName,

              service:
                service,

              appointment_date:
                appointmentDate,

              appointment_time:
                appointmentTime,

              status:
                status

            })
            .eq(
              "id",
              editingAppointmentId
            );

      }


      // INSERT
      else {

        result =
  await supabaseClient
    .from("appointments")
    .insert({

      user_id:
        user.id,

      customer_id:
        customerId,

      customer_name:
        customerName,

      service:
        service,

      appointment_date:
        appointmentDate,

      appointment_time:
        appointmentTime,

      status:
        status

    });

      }


      if (result.error) {

        console.error(
          "Appointment save error:",
          result.error
        );

        alert(
          "Could not save appointment:\n\n" +
          result.error.message
        );

        return;
      }


      closeAppointmentForm();

      appointmentForm.reset();

      editingAppointmentId = null;


      await loadAppointments();


      alert(
        "Appointment saved successfully!"
      );

    }
  );

}





// ==========================================
// DELETE APPOINTMENT
// ==========================================

async function deleteAppointment(
  appointmentId
) {

  const confirmed =
    confirm(
      "Are you sure you want to delete this appointment?"
    );


  if (!confirmed) return;


  const result =
    await supabaseClient
      .from("appointments")
      .delete()
      .eq(
        "id",
        appointmentId
      );


  if (result.error) {

    console.error(
      "Appointment delete error:",
      result.error
    );

    alert(
      "Could not delete appointment:\n\n" +
      result.error.message
    );

    return;
  }


  await loadAppointments();


  alert(
    "Appointment deleted successfully!"
  );

}
// ==========================================
// EDIT EXISTING APPOINTMENT
// ==========================================

async function editAppointment(
  appointmentId
) {

  const result =
    await supabaseClient
      .from("appointments")
      .select("*")
      .eq("id", appointmentId)
      .single();


  if (result.error) {

    console.error(
      "Appointment loading error:",
      result.error
    );

    alert(
      "Unable to load appointment."
    );

    return;
  }


  const appointment =
    result.data;


  editingAppointmentId =
    appointmentId;


  document.getElementById(
    "appointmentCustomer"
  ).value =
    appointment.customer_name || "";


  document.getElementById(
    "appointmentService"
  ).value =
    appointment.service || "";


  document.getElementById(
    "appointmentDate"
  ).value =
    appointment.appointment_date || "";


  document.getElementById(
    "appointmentTime"
  ).value =
    appointment.appointment_time || "";


  document.getElementById(
    "appointmentStatus"
  ).value =
    appointment.status || "Confirmed";


  const title =
    document.getElementById(
      "appointmentModalTitle"
    );

  const description =
    document.getElementById(
      "appointmentModalDescription"
    );

  const button =
    document.getElementById(
      "appointmentSubmitButton"
    );


  if (title) {
    title.textContent =
      "Edit Appointment";
  }

  if (description) {
    description.textContent =
      "Update the appointment details.";
  }

  if (button) {
    button.textContent =
      "Update Appointment";
  }


  const modal =
    document.getElementById(
      "appointmentModal"
    );


  if (modal) {
    modal.style.display =
      "flex";
  }

}

// ==========================================
// LOAD APPOINTMENTS WHEN PAGE OPENS
// ==========================================

if (
  document.getElementById(
    "appointmentsList"
  )
) {

  loadAppointments();

}
// ==========================================
// LOAD CUSTOMERS INTO APPOINTMENT DROPDOWN
// ==========================================

async function loadAppointmentCustomers() {

  const customerSelect =
    document.getElementById(
      "appointmentCustomer"
    );

  if (!customerSelect) return;


  const userResult =
    await supabaseClient.auth.getUser();


  if (
    userResult.error ||
    !userResult.data.user
  ) {
    return;
  }


  const user =
    userResult.data.user;


  const result =
    await supabaseClient
      .from("customers")
      .select("id, name")
      .eq(
        "user_id",
        user.id
      )
      .order(
        "name",
        {
          ascending: true
        }
      );


  if (result.error) {

    console.error(
      "Appointment customer loading error:",
      result.error
    );

    return;
  }


  customerSelect.innerHTML = `
    <option value="">
      Select a customer
    </option>
  `;


  (result.data || []).forEach(
    customer => {

      const option =
        document.createElement("option");

      option.value =
  customer.id;

option.textContent =
  customer.name;

      customerSelect.appendChild(
        option
      );

    }
  );

}


// ==========================================
// LOAD APPOINTMENT CUSTOMERS
// ==========================================

if (
  document.getElementById(
    "appointmentCustomer"
  )
) {

  loadAppointmentCustomers();

}

// ==========================================
// BIZORA PAYMENTS
// ==========================================

let allPayments = [];

// Open payment modal
function openPaymentForm() {
  const modal = document.getElementById("paymentModal");
  if (modal) modal.style.display = "flex";

  const dateInput = document.getElementById("paymentDate");
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split("T")[0];
  }
}

// Close payment modal
function closePaymentForm() {
  const modal = document.getElementById("paymentModal");
  if (modal) modal.style.display = "none";
}

// Load payments
async function loadPayments() {

  const list = document.getElementById("paymentsList");
  if (!list) return;

  const result = await supabaseClient
    .from("payments")
    .select("*")
    .order("payment_date", { ascending: false });

  if (result.error) {
    console.error(result.error);
    list.innerHTML = "<p>Unable to load payments.</p>";
    return;
  }

  allPayments = result.data || [];

  updatePaymentSummary();
  displayPayments(allPayments);
}

// Payment summary cards
function updatePaymentSummary() {

  const totalRevenue = allPayments
    .filter(p => p.status === "Completed")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const completed = allPayments.filter(p => p.status === "Completed").length;
  const pending = allPayments.filter(p => p.status === "Pending").length;

  const revenueEl = document.getElementById("paymentRevenue");
  const countEl = document.getElementById("paymentCount");
  const completedEl = document.getElementById("completedPayments");
  const pendingEl = document.getElementById("pendingPayments");

  if (revenueEl) revenueEl.textContent = "₹" + totalRevenue.toFixed(2);
  if (countEl) countEl.textContent = allPayments.length;
  if (completedEl) completedEl.textContent = completed;
  if (pendingEl) pendingEl.textContent = pending;
}

// Display payments
function displayPayments(payments) {

  const list = document.getElementById("paymentsList");
  if (!list) return;

  if (payments.length === 0) {
    list.innerHTML = `
      <div style="padding:30px;text-align:center;">
        <h3>No payments yet</h3>
        <p>Add your first payment.</p>
      </div>`;
    return;
  }

  list.innerHTML = payments.map(payment => {

    const initial = payment.customer_name.charAt(0).toUpperCase();

    return `
      <div class="customer-row">

        <div class="customer-avatar">${initial}</div>

        <div style="flex:1;">

          <strong>${payment.customer_name}</strong>

          <span>${payment.payment_method}</span>

          <small>${payment.payment_date}</small>

        </div>

        <div style="text-align:right;min-width:100px;">

          <strong>₹${Number(payment.amount).toFixed(2)}</strong>

          <br>

          <span style="
            font-size:12px;
            color:${payment.status==="Completed"?"green":payment.status==="Pending"?"orange":"red"};
          ">
            ${payment.status}
          </span>

        </div>

        <div style="display:flex;gap:8px;">

          <button class="btn" onclick="editPayment('${payment.id}')">
            Edit
          </button>

          <button class="btn" onclick="deletePayment('${payment.id}')">
            Delete
          </button>

        </div>

      </div>
    `;

  }).join("");
}

// Search
function searchPayments() {

  const input = document.getElementById("paymentSearch");
  if (!input) return;

  const search = input.value.toLowerCase();

  displayPayments(
    allPayments.filter(payment =>
      payment.customer_name.toLowerCase().includes(search) ||
      payment.payment_method.toLowerCase().includes(search) ||
      payment.status.toLowerCase().includes(search)
    )
  );
}

// ==========================================
// ADD / UPDATE PAYMENT
// ==========================================

const paymentForm =
  document.getElementById(
    "paymentForm"
  );


if (paymentForm) {

  paymentForm.addEventListener(
    "submit",
    async function(event) {

      event.preventDefault();


      const userResult =
        await supabaseClient.auth.getUser();


      if (
        userResult.error ||
        !userResult.data.user
      ) {

        alert(
          "Please log in again."
        );

        window.location.href =
          "login.html";

        return;
      }


      const user =
        userResult.data.user;


      const customerName =
        document
          .getElementById(
            "paymentCustomer"
          )
          .value
          .trim();


      const amount =
        Number(
          document.getElementById(
            "paymentAmount"
          ).value
        );


      const method =
        document.getElementById(
          "paymentMethod"
        ).value;


      const status =
        document.getElementById(
          "paymentStatus"
        ).value;


      const date =
        document.getElementById(
          "paymentDate"
        ).value;


      if (
        !customerName ||
        !amount ||
        !date
      ) {

        alert(
          "Please fill in all required fields."
        );

        return;
      }


      const button =
        document.getElementById(
          "paymentSubmitButton"
        );


      button.disabled =
        true;


      try {

        let result;


        // UPDATE
        if (editingPaymentId) {

          result =
            await supabaseClient
              .from("payments")
              .update({

                customer_name:
                  customerName,

                amount:
                  amount,

                payment_method:
                  method,

                status:
                  status,

                payment_date:
                  date

              })
              .eq(
                "id",
                editingPaymentId
              );

        }


        // INSERT
        else {

          result =
            await supabaseClient
              .from("payments")
              .insert({

                user_id:
                  user.id,

                customer_name:
                  customerName,

                amount:
                  amount,

                payment_method:
                  method,

                status:
                  status,

                payment_date:
                  date

              });

        }


        if (result.error) {

          throw result.error;

        }


        closePaymentForm();


        paymentForm.reset();


        editingPaymentId =
          null;


        document.getElementById(
          "paymentModalTitle"
        ).textContent =
          "Add Payment";


        button.textContent =
          "Save Payment";


        await loadPayments();


        alert(
          "Payment saved successfully!"
        );


      } catch (error) {

        console.error(
          "Payment save error:",
          error
        );


        alert(
          "Could not save payment:\n\n" +
          error.message
        );

      } finally {

        button.disabled =
          false;

      }

    }
  );

}

// ==========================================
// EDIT PAYMENT - PROFESSIONAL FORM
// ==========================================

let editingPaymentId = null;


async function editPayment(id) {

  const result =
    await supabaseClient
      .from("payments")
      .select("*")
      .eq("id", id)
      .single();


  if (result.error) {

    console.error(
      "Payment loading error:",
      result.error
    );

    alert(
      "Unable to load payment."
    );

    return;
  }


  const payment =
    result.data;


  editingPaymentId =
    id;


  document.getElementById(
    "paymentModalTitle"
  ).textContent =
    "Edit Payment";


  document.getElementById(
    "paymentSubmitButton"
  ).textContent =
    "Update Payment";


  document.getElementById(
    "paymentCustomer"
  ).value =
    payment.customer_name || "";


  document.getElementById(
    "paymentAmount"
  ).value =
    payment.amount || "";


  document.getElementById(
    "paymentMethod"
  ).value =
    payment.payment_method || "Cash";


  document.getElementById(
    "paymentStatus"
  ).value =
    payment.status || "Completed";


  document.getElementById(
    "paymentDate"
  ).value =
    payment.payment_date || "";


  const modal =
    document.getElementById(
      "paymentModal"
    );


  if (modal) {

    modal.style.display =
      "flex";

  }

}


// Delete payment
async function deletePayment(id){

  if(!confirm("Delete this payment?")) return;

  const result = await supabaseClient
    .from("payments")
    .delete()
    .eq("id", id);

  if(result.error){

    alert(result.error.message);

    return;

  }

  loadPayments();

}

// Load automatically
loadPayments();
// ==========================================
// APPOINTMENT CLOSE FUNCTION
// ==========================================

window.closeAppointmentForm = function () {

  const modal =
    document.getElementById("appointmentModal");

  if (modal) {
    modal.style.display = "none";
  }

  // Exit edit mode
  if (typeof editingAppointmentId !== "undefined") {
    editingAppointmentId = null;
  }

};
// =====================================================
// BIZORA — INVOICES
// =====================================================

let invoicesData = [];
let editingInvoiceId = null;


// -----------------------------------------------------
// LOAD INVOICES
// -----------------------------------------------------

async function loadInvoices() {

  if (!supabaseClient) {
    console.error("Supabase client not found.");
    return;
  }

  const {
    data: {
      user
    },
    error: userError
  } = await supabaseClient.auth.getUser();

  if (userError || !user) {
    console.error("No logged-in user.");
    return;
  }


  const {
    data,
    error
  } = await supabaseClient
    .from("invoices")
    .select(`
      id,
      invoice_number,
      customer_id,
      amount,
      invoice_date,
      due_date,
      status,
      notes,
      created_at,
      customers (
        name
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false
    });


  if (error) {

    console.error(
      "Error loading invoices:",
      error
    );

    return;
  }


  invoicesData = data || [];

  displayInvoices(invoicesData);

  updateInvoiceStats(invoicesData);

  loadInvoiceCustomers();
}



// -----------------------------------------------------
// DISPLAY INVOICES
// -----------------------------------------------------

function displayInvoices(invoices) {

  const list =
    document.getElementById(
      "invoicesList"
    );

  const count =
    document.getElementById(
      "invoiceCount"
    );


  if (!list) {
    return;
  }


  if (!invoices || invoices.length === 0) {

    list.innerHTML = `

      <div
        style="
          text-align:center;
          padding:40px;
          color:#667085;
        "
      >

        <div
          style="
            font-size:42px;
            margin-bottom:10px;
          "
        >
          📄
        </div>

        <h3>
          No invoices yet
        </h3>

        <p>
          Create your first invoice to get started.
        </p>

      </div>

    `;


    if (count) {
      count.textContent =
        "No invoices yet";
    }

    return;
  }


  if (count) {

    count.textContent =
      `${invoices.length} invoice${
        invoices.length === 1
          ? ""
          : "s"
      }`;

  }


  list.innerHTML =
    invoices.map(
      invoice => {

        const customerName =
          invoice.customers?.name ||
          "No customer";


        const amount =
          Number(invoice.amount || 0)
            .toLocaleString(
              "en-IN",
              {
                minimumFractionDigits: 2
              }
            );


        const statusClass =
          invoice.status
            .toLowerCase()
            .replace(/\s+/g, "-");


        return `

          <div
            class="customer-row"
            data-invoice-id="${invoice.id}"
          >

            <div class="customer-avatar">
              📄
            </div>


            <div
              style="
                flex:1;
                min-width:0;
              "
            >

              <strong>
                ${escapeInvoiceHTML(
                  invoice.invoice_number
                )}
              </strong>

              <span>
                ${escapeInvoiceHTML(
                  customerName
                )}
              </span>

            </div>


            <div
              style="
                text-align:right;
                margin-right:20px;
              "
            >

              <strong>
                ₹${amount}
              </strong>

              <span>
                ${invoice.invoice_date || ""}
              </span>

            </div>


            <span
              class="appointment-status ${statusClass}"
            >
              ${escapeInvoiceHTML(
                invoice.status
              )}
            </span>


            <div
              style="
                display:flex;
                gap:8px;
                margin-left:15px;
              "
            >

              <button
                type="button"
                class="btn"
                onclick="editInvoice('${invoice.id}')"
              >
                Edit
              </button>

              <button
                type="button"
                class="btn"
                onclick="deleteInvoice('${invoice.id}')"
              >
                Delete
              </button>

            </div>

          </div>

        `;

      }
    ).join("");

}



// -----------------------------------------------------
// INVOICE STATISTICS
// -----------------------------------------------------

function updateInvoiceStats(
  invoices
) {

  const total =
    invoices.length;


  const paid =
    invoices.filter(
      invoice =>
        invoice.status === "Paid"
    ).length;


  const pending =
    invoices.filter(
      invoice =>
        invoice.status === "Pending"
    ).length;


  const totalAmount =
    invoices.reduce(
      (sum, invoice) =>
        sum +
        Number(invoice.amount || 0),
      0
    );


  const totalElement =
    document.getElementById(
      "totalInvoices"
    );

  const paidElement =
    document.getElementById(
      "paidInvoices"
    );

  const pendingElement =
    document.getElementById(
      "pendingInvoices"
    );

  const amountElement =
    document.getElementById(
      "invoiceTotalAmount"
    );


  if (totalElement) {
    totalElement.textContent =
      total;
  }


  if (paidElement) {
    paidElement.textContent =
      paid;
  }


  if (pendingElement) {
    pendingElement.textContent =
      pending;
  }


  if (amountElement) {

    amountElement.textContent =
      "₹" +
      totalAmount.toLocaleString(
        "en-IN",
        {
          minimumFractionDigits: 2
        }
      );

  }

}



// -----------------------------------------------------
// LOAD CUSTOMERS INTO INVOICE DROPDOWN
// -----------------------------------------------------

async function loadInvoiceCustomers() {

  const select =
    document.getElementById(
      "invoiceCustomer"
    );


  if (!select) {
    return;
  }


  const {
    data: {
      user
    }
  } =
    await supabaseClient.auth.getUser();


  if (!user) {
    return;
  }


  const {
    data,
    error
  } =
    await supabaseClient
      .from("customers")
      .select("id, name")
      .eq("user_id", user.id)
      .order("name");


  if (error) {

    console.error(
      "Error loading customers:",
      error
    );

    return;
  }


  select.innerHTML = `
    <option value="">
      Select a customer
    </option>
  `;


  (data || []).forEach(
    customer => {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        customer.id;

      option.textContent =
        customer.name;

      select.appendChild(
        option
      );

    }
  );

}



// -----------------------------------------------------
// OPEN NEW INVOICE FORM
// -----------------------------------------------------

function openInvoiceForm() {

  editingInvoiceId = null;


  const modal =
    document.getElementById(
      "invoiceModal"
    );

  const form =
    document.getElementById(
      "invoiceForm"
    );

  const title =
    document.getElementById(
      "invoiceModalTitle"
    );

  const description =
    document.getElementById(
      "invoiceModalDescription"
    );

  const submit =
    document.getElementById(
      "invoiceSubmitButton"
    );


  if (!modal || !form) {
    return;
  }


  form.reset();


  if (title) {
    title.textContent =
      "New Invoice";
  }


  if (description) {
    description.textContent =
      "Create an invoice for a customer.";
  }


  if (submit) {
    submit.textContent =
      "Save Invoice";
  }


  const date =
    document.getElementById(
      "invoiceDate"
    );


  if (date) {

    date.value =
      new Date()
        .toISOString()
        .split("T")[0];

  }


  loadInvoiceCustomers();


  modal.style.display =
    "flex";

}



// -----------------------------------------------------
// CLOSE INVOICE FORM
// -----------------------------------------------------

function closeInvoiceForm() {

  const modal =
    document.getElementById(
      "invoiceModal"
    );


  if (modal) {

    modal.style.display =
      "none";

  }


  editingInvoiceId = null;

}



// -----------------------------------------------------
// EDIT INVOICE
// -----------------------------------------------------

async function editInvoice(
  invoiceId
) {

  const invoice =
    invoicesData.find(
      item =>
        item.id === invoiceId
    );


  if (!invoice) {

    console.error(
      "Invoice not found."
    );

    return;
  }


  editingInvoiceId =
    invoiceId;


  const modal =
    document.getElementById(
      "invoiceModal"
    );

  const title =
    document.getElementById(
      "invoiceModalTitle"
    );

  const description =
    document.getElementById(
      "invoiceModalDescription"
    );

  const submit =
    document.getElementById(
      "invoiceSubmitButton"
    );


  if (title) {
    title.textContent =
      "Edit Invoice";
  }


  if (description) {
    description.textContent =
      "Update invoice information.";
  }


  if (submit) {
    submit.textContent =
      "Update Invoice";
  }


  await loadInvoiceCustomers();


  document.getElementById(
    "invoiceNumber"
  ).value =
    invoice.invoice_number || "";


  document.getElementById(
    "invoiceCustomer"
  ).value =
    invoice.customer_id || "";


  document.getElementById(
    "invoiceAmount"
  ).value =
    invoice.amount || "";


  document.getElementById(
    "invoiceDate"
  ).value =
    invoice.invoice_date || "";


  document.getElementById(
    "invoiceDueDate"
  ).value =
    invoice.due_date || "";


  document.getElementById(
    "invoiceStatus"
  ).value =
    invoice.status || "Pending";


  document.getElementById(
    "invoiceNotes"
  ).value =
    invoice.notes || "";


  if (modal) {

    modal.style.display =
      "flex";

  }

}



// -----------------------------------------------------
// SAVE / UPDATE INVOICE
// -----------------------------------------------------

async function saveInvoice(
  event
) {

  event.preventDefault();


  const {
    data: {
      user
    }
  } =
    await supabaseClient.auth.getUser();


  if (!user) {

    alert(
      "Please log in first."
    );

    return;
  }


  const invoiceNumber =
    document.getElementById(
      "invoiceNumber"
    ).value.trim();


  const customerId =
    document.getElementById(
      "invoiceCustomer"
    ).value;


  const amount =
    document.getElementById(
      "invoiceAmount"
    ).value;


  const invoiceDate =
    document.getElementById(
      "invoiceDate"
    ).value;


  const dueDate =
    document.getElementById(
      "invoiceDueDate"
    ).value ||
    null;


  const status =
    document.getElementById(
      "invoiceStatus"
    ).value;


  const notes =
    document.getElementById(
      "invoiceNotes"
    ).value.trim();


  const invoiceData = {

    user_id:
      user.id,

    invoice_number:
      invoiceNumber,

    customer_id:
      customerId || null,

    amount:
      Number(amount),

    invoice_date:
      invoiceDate,

    due_date:
      dueDate,

    status:
      status,

    notes:
      notes || null

  };


  let result;


  if (editingInvoiceId) {

    result =
      await supabaseClient
        .from("invoices")
        .update(
          invoiceData
        )
        .eq(
          "id",
          editingInvoiceId
        )
        .eq(
          "user_id",
          user.id
        );

  } else {

    result =
      await supabaseClient
        .from("invoices")
        .insert(
          invoiceData
        );

  }


  if (result.error) {

    console.error(
      "Invoice save error:",
      result.error
    );

    alert(
      result.error.message
    );

    return;
  }


  alert(
    editingInvoiceId
      ? "Invoice updated successfully!"
      : "Invoice created successfully!"
  );


  closeInvoiceForm();


  loadInvoices();

}



// -----------------------------------------------------
// DELETE INVOICE
// -----------------------------------------------------

async function deleteInvoice(
  invoiceId
) {

  const confirmed =
    confirm(
      "Are you sure you want to delete this invoice?"
    );


  if (!confirmed) {
    return;
  }


  const {
    data: {
      user
    }
  } =
    await supabaseClient.auth.getUser();


  if (!user) {
    return;
  }


  const {
    error
  } =
    await supabaseClient
      .from("invoices")
      .delete()
      .eq(
        "id",
        invoiceId
      )
      .eq(
        "user_id",
        user.id
      );


  if (error) {

    console.error(
      "Delete invoice error:",
      error
    );

    alert(
      error.message
    );

    return;
  }


  loadInvoices();

}



// -----------------------------------------------------
// SEARCH INVOICES
// -----------------------------------------------------

function searchInvoices() {

  const searchInput =
    document.getElementById(
      "invoiceSearch"
    );


  if (!searchInput) {
    return;
  }


  const search =
    searchInput.value
      .trim()
      .toLowerCase();


  if (!search) {

    displayInvoices(
      invoicesData
    );

    return;
  }


  const filtered =
    invoicesData.filter(
      invoice => {

        const number =
          (
            invoice.invoice_number ||
            ""
          ).toLowerCase();


        const customer =
          (
            invoice.customers?.name ||
            ""
          ).toLowerCase();


        const status =
          (
            invoice.status ||
            ""
          ).toLowerCase();


        return (
          number.includes(search) ||
          customer.includes(search) ||
          status.includes(search)
        );

      }
    );


  displayInvoices(
    filtered
  );

}



// -----------------------------------------------------
// SIMPLE HTML ESCAPE
// -----------------------------------------------------

function escapeInvoiceHTML(
  value
) {

  return String(value ?? "")
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}



// -----------------------------------------------------
// INITIALIZE INVOICE PAGE
// -----------------------------------------------------

document.addEventListener(
  "DOMContentLoaded",
  function () {

    const invoiceForm =
      document.getElementById(
        "invoiceForm"
      );


    if (invoiceForm) {

      invoiceForm.addEventListener(
        "submit",
        saveInvoice
      );

      loadInvoices();

    }

  }
);
// =====================================================
// BIZORA — STAFF
// =====================================================

let staffData = [];
let editingStaffId = null;


// -----------------------------------------------------
// LOAD STAFF
// -----------------------------------------------------

async function loadStaff() {

  if (!supabaseClient) {
    console.error("Supabase client not found.");
    return;
  }

  const {
    data: {
      user
    },
    error: userError
  } = await supabaseClient.auth.getUser();

  if (userError || !user) {
    console.error("No logged-in user.");
    return;
  }


  const {
    data,
    error
  } = await supabaseClient
    .from("staff")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false
    });


  if (error) {

    console.error(
      "Error loading staff:",
      error
    );

    return;
  }


  staffData = data || [];

  displayStaff(staffData);

  updateStaffStats(staffData);

}



// -----------------------------------------------------
// DISPLAY STAFF
// -----------------------------------------------------

function displayStaff(staff) {

  const list =
    document.getElementById(
      "staffList"
    );

  const count =
    document.getElementById(
      "staffCount"
    );


  if (!list) {
    return;
  }


  if (!staff || staff.length === 0) {

    list.innerHTML = `

      <div
        style="
          text-align:center;
          padding:40px;
          color:#667085;
        "
      >

        <div
          style="
            font-size:42px;
            margin-bottom:10px;
          "
        >
          👤
        </div>

        <h3>
          No staff members yet
        </h3>

        <p>
          Add your first team member to get started.
        </p>

      </div>

    `;


    if (count) {
      count.textContent =
        "No staff members yet";
    }

    return;
  }


  if (count) {

    count.textContent =
      `${staff.length} staff member${
        staff.length === 1
          ? ""
          : "s"
      }`;

  }


  list.innerHTML =
    staff.map(
      member => {

        const initials =
          getStaffInitials(
            member.name
          );


        const statusClass =
          member.status
            .toLowerCase()
            .replace(/\s+/g, "-");


        return `

          <div
            class="customer-row"
            data-staff-id="${member.id}"
          >

            <div class="customer-avatar">
              ${escapeStaffHTML(initials)}
            </div>


            <div
              style="
                flex:1;
                min-width:0;
              "
            >

              <strong>
                ${escapeStaffHTML(
                  member.name
                )}
              </strong>

              <span>
                ${escapeStaffHTML(
                  member.email
                )}
              </span>

              ${
                member.phone
                  ? `
                    <span>
                      ${escapeStaffHTML(
                        member.phone
                      )}
                    </span>
                  `
                  : ""
              }

            </div>


            <div
              style="
                min-width:110px;
              "
            >

              <strong>
                ${escapeStaffHTML(
                  member.role
                )}
              </strong>

              <span>
                ${
                  member.join_date
                    ? "Joined " +
                      member.join_date
                    : ""
                }
              </span>

            </div>


            <span
              class="appointment-status ${statusClass}"
            >
              ${escapeStaffHTML(
                member.status
              )}
            </span>


            <div
              style="
                display:flex;
                gap:8px;
                margin-left:15px;
              "
            >

              <button
                type="button"
                class="btn"
                onclick="editStaff('${member.id}')"
              >
                Edit
              </button>

              <button
                type="button"
                class="btn"
                onclick="deleteStaff('${member.id}')"
              >
                Delete
              </button>

            </div>

          </div>

        `;

      }
    ).join("");

}



// -----------------------------------------------------
// STAFF STATISTICS
// -----------------------------------------------------

function updateStaffStats(
  staff
) {

  const total =
    staff.length;


  const active =
    staff.filter(
      member =>
        member.status === "Active"
    ).length;


  const onLeave =
    staff.filter(
      member =>
        member.status === "On Leave"
    ).length;


  const roles =
    new Set(
      staff.map(
        member =>
          member.role
      )
    ).size;


  const totalElement =
    document.getElementById(
      "totalStaff"
    );

  const activeElement =
    document.getElementById(
      "activeStaff"
    );

  const leaveElement =
    document.getElementById(
      "staffOnLeave"
    );

  const rolesElement =
    document.getElementById(
      "staffRoles"
    );


  if (totalElement) {
    totalElement.textContent =
      total;
  }


  if (activeElement) {
    activeElement.textContent =
      active;
  }


  if (leaveElement) {
    leaveElement.textContent =
      onLeave;
  }


  if (rolesElement) {
    rolesElement.textContent =
      roles;
  }

}



// -----------------------------------------------------
// OPEN ADD STAFF FORM
// -----------------------------------------------------

function openStaffForm() {

  editingStaffId = null;


  const modal =
    document.getElementById(
      "staffModal"
    );

  const form =
    document.getElementById(
      "staffForm"
    );

  const title =
    document.getElementById(
      "staffModalTitle"
    );

  const submit =
    document.getElementById(
      "staffSubmitButton"
    );


  if (!modal || !form) {
    return;
  }


  form.reset();


  if (title) {

    title.textContent =
      "Add Staff";

  }


  if (submit) {

    submit.textContent =
      "Save Staff";

  }


  const joinDate =
    document.getElementById(
      "staffJoinDate"
    );


  if (joinDate) {

    joinDate.value =
      new Date()
        .toISOString()
        .split("T")[0];

  }


  modal.style.display =
    "flex";

}



// -----------------------------------------------------
// CLOSE STAFF FORM
// -----------------------------------------------------

function closeStaffForm() {

  const modal =
    document.getElementById(
      "staffModal"
    );


  if (modal) {

    modal.style.display =
      "none";

  }


  editingStaffId = null;

}



// -----------------------------------------------------
// EDIT STAFF
// -----------------------------------------------------

function editStaff(
  staffId
) {

  const member =
    staffData.find(
      item =>
        item.id === staffId
    );


  if (!member) {

    console.error(
      "Staff member not found."
    );

    return;
  }


  editingStaffId =
    staffId;


  const modal =
    document.getElementById(
      "staffModal"
    );

  const title =
    document.getElementById(
      "staffModalTitle"
    );

  const submit =
    document.getElementById(
      "staffSubmitButton"
    );


  if (title) {

    title.textContent =
      "Edit Staff";

  }


  if (submit) {

    submit.textContent =
      "Update Staff";

  }


  document.getElementById(
    "staffName"
  ).value =
    member.name || "";


  document.getElementById(
    "staffEmail"
  ).value =
    member.email || "";


  document.getElementById(
    "staffPhone"
  ).value =
    member.phone || "";


  document.getElementById(
    "staffRole"
  ).value =
    member.role || "Employee";


  document.getElementById(
    "staffStatus"
  ).value =
    member.status || "Active";


  document.getElementById(
    "staffJoinDate"
  ).value =
    member.join_date || "";


  if (modal) {

    modal.style.display =
      "flex";

  }

}



// -----------------------------------------------------
// SAVE / UPDATE STAFF
// -----------------------------------------------------

async function saveStaff(
  event
) {

  event.preventDefault();


  const {
    data: {
      user
    }
  } =
    await supabaseClient.auth.getUser();


  if (!user) {

    alert(
      "Please log in first."
    );

    return;
  }


  const name =
    document.getElementById(
      "staffName"
    ).value.trim();


  const email =
    document.getElementById(
      "staffEmail"
    ).value.trim();


  const phone =
    document.getElementById(
      "staffPhone"
    ).value.trim();


  const role =
    document.getElementById(
      "staffRole"
    ).value;


  const status =
    document.getElementById(
      "staffStatus"
    ).value;


  const joinDate =
    document.getElementById(
      "staffJoinDate"
    ).value ||
    null;


  const staffInfo = {

    user_id:
      user.id,

    name:
      name,

    email:
      email,

    phone:
      phone || null,

    role:
      role,

    status:
      status,

    join_date:
      joinDate

  };


  let result;


  if (editingStaffId) {

    result =
      await supabaseClient
        .from("staff")
        .update(
          staffInfo
        )
        .eq(
          "id",
          editingStaffId
        )
        .eq(
          "user_id",
          user.id
        );

  } else {

    result =
      await supabaseClient
        .from("staff")
        .insert(
          staffInfo
        );

  }


  if (result.error) {

    console.error(
      "Staff save error:",
      result.error
    );

    alert(
      result.error.message
    );

    return;
  }


  alert(
    editingStaffId
      ? "Staff member updated successfully!"
      : "Staff member added successfully!"
  );


  closeStaffForm();

  loadStaff();

}



// -----------------------------------------------------
// DELETE STAFF
// -----------------------------------------------------

async function deleteStaff(
  staffId
) {

  const confirmed =
    confirm(
      "Are you sure you want to delete this staff member?"
    );


  if (!confirmed) {
    return;
  }


  const {
    data: {
      user
    }
  } =
    await supabaseClient.auth.getUser();


  if (!user) {
    return;
  }


  const {
    error
  } =
    await supabaseClient
      .from("staff")
      .delete()
      .eq(
        "id",
        staffId
      )
      .eq(
        "user_id",
        user.id
      );


  if (error) {

    console.error(
      "Delete staff error:",
      error
    );

    alert(
      error.message
    );

    return;
  }


  loadStaff();

}



// -----------------------------------------------------
// SEARCH STAFF
// -----------------------------------------------------

function searchStaff() {

  const input =
    document.getElementById(
      "staffSearch"
    );


  if (!input) {
    return;
  }


  const search =
    input.value
      .trim()
      .toLowerCase();


  if (!search) {

    displayStaff(
      staffData
    );

    return;
  }


  const filtered =
    staffData.filter(
      member => {

        const name =
          (
            member.name ||
            ""
          ).toLowerCase();


        const email =
          (
            member.email ||
            ""
          ).toLowerCase();


        const phone =
          (
            member.phone ||
            ""
          ).toLowerCase();


        const role =
          (
            member.role ||
            ""
          ).toLowerCase();


        const status =
          (
            member.status ||
            ""
          ).toLowerCase();


        return (
          name.includes(search) ||
          email.includes(search) ||
          phone.includes(search) ||
          role.includes(search) ||
          status.includes(search)
        );

      }
    );


  displayStaff(
    filtered
  );

}



// -----------------------------------------------------
// STAFF INITIALS
// -----------------------------------------------------

function getStaffInitials(
  name
) {

  const words =
    String(name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);


  if (words.length === 0) {
    return "?";
  }


  if (words.length === 1) {

    return words[0]
      .substring(0, 2)
      .toUpperCase();

  }


  return (
    words[0][0] +
    words[1][0]
  ).toUpperCase();

}



// -----------------------------------------------------
// HTML ESCAPE
// -----------------------------------------------------

function escapeStaffHTML(
  value
) {

  return String(value ?? "")
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}



// -----------------------------------------------------
// INITIALIZE STAFF PAGE
// -----------------------------------------------------

document.addEventListener(
  "DOMContentLoaded",
  function () {

    const staffForm =
      document.getElementById(
        "staffForm"
      );


    if (staffForm) {

      staffForm.addEventListener(
        "submit",
        saveStaff
      );

      loadStaff();

    }

  }
);
// =====================================================
// BIZORA — SETTINGS
// =====================================================

async function loadSettings() {

  if (!supabaseClient) {
    console.error("Supabase client not found.");
    return;
  }

  const {
    data: {
      user
    },
    error
  } = await supabaseClient.auth.getUser();

  if (error || !user) {
    console.error("No logged-in user.");
    return;
  }

  const metadata = user.user_metadata || {};

  // Profile information
  const fullName =
    metadata.full_name || "";

  const businessName =
    metadata.business_name || "";

  const phone =
    metadata.phone || "";

  const email =
    user.email || "";


  // Profile form
  const fullNameInput =
    document.getElementById("settingsFullName");

  const emailInput =
    document.getElementById("settingsEmail");

  const phoneInput =
    document.getElementById("settingsPhone");

  const businessNameInput =
    document.getElementById("settingsBusinessName");


  if (fullNameInput) {
    fullNameInput.value = fullName;
  }

  if (emailInput) {
    emailInput.value = email;
  }

  if (phoneInput) {
    phoneInput.value = phone;
  }

  if (businessNameInput) {
    businessNameInput.value = businessName;
  }


  // Business settings form
  const businessNameField =
    document.getElementById("businessName");

  const businessPhoneField =
    document.getElementById("businessPhone");

  if (businessNameField) {
    businessNameField.value = businessName;
  }

  if (businessPhoneField) {
    businessPhoneField.value = phone;
  }

}



// =====================================================
// SAVE PROFILE SETTINGS
// =====================================================

async function saveProfileSettings(event) {

  event.preventDefault();

  const {
    data: {
      user
    },
    error: userError
  } = await supabaseClient.auth.getUser();


  if (userError || !user) {

    alert("Please log in first.");

    return;
  }


  const fullName =
    document.getElementById(
      "settingsFullName"
    )?.value.trim() || "";


  const phone =
    document.getElementById(
      "settingsPhone"
    )?.value.trim() || "";


  const businessName =
    document.getElementById(
      "settingsBusinessName"
    )?.value.trim() || "";


  const {
    error
  } =
    await supabaseClient.auth.updateUser({

      data: {

        full_name:
          fullName,

        phone:
          phone,

        business_name:
          businessName

      }

    });


  if (error) {

    console.error(
      "Profile update error:",
      error
    );

    alert(
      error.message
    );

    return;
  }


  alert(
    "Profile saved successfully!"
  );


  // Refresh fields
  await loadSettings();

}



// =====================================================
// SAVE BUSINESS SETTINGS
// =====================================================

async function saveBusinessSettings(event) {

  event.preventDefault();


  const {
    data: {
      user
    }
  } =
    await supabaseClient.auth.getUser();


  if (!user) {

    alert(
      "Please log in first."
    );

    return;
  }


  const businessName =
    document.getElementById(
      "businessName"
    )?.value.trim() || "";


  const businessPhone =
    document.getElementById(
      "businessPhone"
    )?.value.trim() || "";


  const {
    error
  } =
    await supabaseClient.auth.updateUser({

      data: {

        business_name:
          businessName,

        phone:
          businessPhone

      }

    });


  if (error) {

    console.error(
      "Business settings update error:",
      error
    );

    alert(
      error.message
    );

    return;
  }


  alert(
    "Business settings saved successfully!"
  );


  await loadSettings();

}



// =====================================================
// CHANGE PASSWORD
// =====================================================

async function changePassword() {

  const newPassword =
    prompt(
      "Enter your new password:"
    );


  if (!newPassword) {
    return;
  }


  if (newPassword.length < 6) {

    alert(
      "Password must be at least 6 characters."
    );

    return;
  }


  const {
    error
  } =
    await supabaseClient.auth.updateUser({

      password:
        newPassword

    });


  if (error) {

    console.error(
      "Password update error:",
      error
    );

    alert(
      error.message
    );

    return;
  }


  alert(
    "Password changed successfully!"
  );

}



// =====================================================
// SETTINGS PAGE INITIALIZATION
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    const profileForm =
      document.getElementById(
        "profileSettingsForm"
      );

    const businessForm =
      document.getElementById(
        "businessSettingsForm"
      );


    if (
      profileForm ||
      businessForm
    ) {

      loadSettings();

    }


    if (profileForm) {

      profileForm.addEventListener(
        "submit",
        saveProfileSettings
      );

    }


    if (businessForm) {

      businessForm.addEventListener(
        "submit",
        saveBusinessSettings
      );

    }

  }
);
// =====================================================
// BIZORA — REPORTS
// =====================================================

async function loadReports() {

console.log("Loading Bizora reports...");

if (!supabaseClient) {
console.error("Supabase client not found.");
return;
}

const {
data: {
user
},
error: userError
} = await supabaseClient.auth.getUser();

if (userError || !user) {
console.error("No logged-in user.");
return;
}

// =============================================
// CUSTOMERS
// =============================================

const {
data: customers,
error: customersError
} = await supabaseClient
.from("customers")
.select("id, created_at")
.eq("user_id", user.id);

if (customersError) {
console.error(
"Customers report error:",
customersError
);
}

// =============================================
// APPOINTMENTS
// =============================================

const {
data: appointments,
error: appointmentsError
} = await supabaseClient
.from("appointments")
.select(
"id, user_id, customer_name, service, appointment_date, appointment_time, status, created_at"
)
.eq("user_id", user.id);

if (appointmentsError) {
console.error(
"Appointments report error:",
appointmentsError
);
}

// =============================================
// PAYMENTS
// =============================================

const {
data: payments,
error: paymentsError
} = await supabaseClient
.from("payments")
.select(
"id, user_id, customer_name, amount, payment_method, status, payment_date, created_at"
)
.eq("user_id", user.id);

if (paymentsError) {
console.error(
"Payments report error:",
paymentsError
);
}

// =============================================
// INVOICES
// =============================================

const {
data: invoices,
error: invoicesError
} = await supabaseClient
.from("invoices")
.select(
"id, user_id, invoice_number, customer_id, amount, invoice_date, due_date, status, notes, created_at"
)
.eq("user_id", user.id);

if (invoicesError) {
console.error(
"Invoices report error:",
invoicesError
);
}

// =============================================
// SAFE ARRAYS
// =============================================

const customerList =
customers || [];

const appointmentList =
appointments || [];

const paymentList =
payments || [];
renderDashboardRevenueChart(
  paymentList
);
const invoiceList =
invoices || [];

// =============================================
// CUSTOMER SUMMARY
// =============================================

const totalCustomers =
customerList.length;

setReportValue(
"reportCustomers",
totalCustomers
);

setReportValue(
"summaryCustomers",
totalCustomers
);

// =============================================
// NEW CUSTOMERS
// =============================================

setReportValue(
"newCustomers",
totalCustomers
);

// =============================================
// APPOINTMENT SUMMARY
// =============================================

const totalAppointments =
appointmentList.length;

const confirmedAppointments =
appointmentList.filter(
appointment =>
String(
appointment.status || ""
).trim().toLowerCase() ===
"confirmed"
).length;

const pendingAppointments =
appointmentList.filter(
appointment =>
String(
appointment.status || ""
).trim().toLowerCase() ===
"pending"
).length;

const cancelledAppointments =
appointmentList.filter(
appointment =>
String(
appointment.status || ""
).trim().toLowerCase() ===
"cancelled"
).length;

setReportValue(
"reportAppointments",
totalAppointments
);

setReportValue(
"confirmedAppointments",
confirmedAppointments
);

setReportValue(
"pendingAppointments",
pendingAppointments
);

setReportValue(
"cancelledAppointments",
cancelledAppointments
);

// =============================================
// PAYMENT SUMMARY
// =============================================

const completedPaymentList =
  paymentList.filter(
    payment =>
      String(
        payment.status || ""
      ).trim().toLowerCase() ===
      "completed"
  );


// Number of completed payments

const completedPaymentCount =
  completedPaymentList.length;


// Total money actually received

const totalReceived =
  completedPaymentList.reduce(
    (total, payment) => {

      return (
        total +
        Number(
          payment.amount || 0
        )
      );

    },
    0
  );


// Payments box = NUMBER of completed payments

setReportValue(
  "reportPayments",
  completedPaymentCount
);


// Revenue box = TOTAL MONEY RECEIVED

setReportValue(
  "reportRevenue",
  formatReportCurrency(
    totalReceived
  )
);

// =============================================
// INVOICE SUMMARY
// =============================================

const paidInvoiceList =
invoiceList.filter(
invoice =>
String(
invoice.status || ""
).trim().toLowerCase() ===
"paid"
);

const pendingInvoiceList =
invoiceList.filter(
invoice =>
String(
invoice.status || ""
).trim().toLowerCase() ===
"pending"
);

const overdueInvoiceList =
invoiceList.filter(
invoice =>
String(
invoice.status || ""
).trim().toLowerCase() ===
"overdue"
);

const totalInvoiceRevenue =
paidInvoiceList.reduce(
(total, invoice) => {

    return (
      total +
      Number(
        invoice.amount || 0
      )
    );

  },
  0
);

setReportValue(
"reportInvoices",
invoiceList.length
);

setReportValue(
"reportPaidInvoices",
paidInvoiceList.length
);

setReportValue(
"reportPendingInvoices",
pendingInvoiceList.length
);

setReportValue(
"reportOverdueInvoices",
overdueInvoiceList.length
);



// =============================================
// DEBUG
// =============================================

console.log(
"REPORT DATA:",
{
customers:
customerList.length,

  appointments:
    appointmentList.length,

  confirmedAppointments:
    confirmedAppointments,

  pendingAppointments:
    pendingAppointments,

  cancelledAppointments:
    cancelledAppointments,

  payments:
    paymentList.length,

   paymentAmount:
  totalReceived,

  invoices:
    invoiceList.length,

  paidInvoices:
    paidInvoiceList.length,

  pendingInvoices:
    pendingInvoiceList.length,

  overdueInvoices:
    overdueInvoiceList.length,

  revenue:
    totalInvoiceRevenue
}

);

console.log(
"Reports loaded successfully."
);

}






// =====================================================
// REPORT HELPER
// =====================================================

function setReportValue(
  elementId,
  value
) {

  const element =
    document.getElementById(
      elementId
    );


  if (element) {

    element.textContent =
      value;

  }

}



// =====================================================
// CURRENCY FORMAT
// =====================================================

function formatReportCurrency(
  amount
) {

  return "₹" +
    Number(amount || 0)
      .toLocaleString(
        "en-IN",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }
      );

}



// =====================================================
// REPORTS PAGE INITIALIZATION
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    const reportsPage =
      document.getElementById(
        "reportCustomers"
      );


    if (reportsPage) {

      loadReports();

    }

  }
);
// =====================================================
// DASHBOARD REAL DATA
// =====================================================

async function loadDashboardData() {

if (!supabaseClient) {
console.error("Supabase client not found.");
return;
}

const {
data: {
user
},
error: userError
} = await supabaseClient.auth.getUser();

if (userError || !user) {
console.error("No logged-in user.");
return;
}

// =============================================
// CUSTOMERS
// =============================================

const {
data: customers,
error: customersError
} = await supabaseClient
.from("customers")
.select("id")
.eq("user_id", user.id);

if (customersError) {
console.error(
"Dashboard customers error:",
customersError
);
}

// =============================================
// APPOINTMENTS
// =============================================

const {
data: appointments,
error: appointmentsError
} = await supabaseClient
.from("appointments")
.select("id")
.eq("user_id", user.id);

if (appointmentsError) {
console.error(
"Dashboard appointments error:",
appointmentsError
);
}

// =============================================
// PAYMENTS
// =============================================

const {
data: payments,
error: paymentsError
} = await supabaseClient
.from("payments")
.select("amount, status, payment_date")
.eq("user_id", user.id);

if (paymentsError) {
console.error(
"Dashboard payments error:",
paymentsError
);
}

const customerList =
customers || [];

const appointmentList =
appointments || [];

const paymentList =
payments || [];
renderDashboardRevenueChart(
  paymentList
);
// =============================================
// CUSTOMER COUNT
// =============================================

const customerCount =
customerList.length;

const customerElement =
document.getElementById(
"dashboardCustomers"
);

if (customerElement) {
customerElement.textContent =
customerCount.toLocaleString("en-IN");
}

// =============================================
// APPOINTMENT COUNT
// =============================================

const appointmentCount =
appointmentList.length;

const appointmentElement =
document.getElementById(
"dashboardAppointments"
);

if (appointmentElement) {
appointmentElement.textContent =
appointmentCount.toLocaleString("en-IN");
}

// =============================================
// COMPLETED PAYMENTS
// =============================================

const completedPayments =
paymentList.filter(
payment =>
String(
payment.status || ""
).trim().toLowerCase() ===
"completed"
);

// =============================================
// TOTAL REVENUE
// =============================================

const totalRevenue =
completedPayments.reduce(
(total, payment) =>
total +
Number(
payment.amount || 0
),
0
);

const revenueElement =
document.getElementById(
"dashboardRevenue"
);

if (revenueElement) {
revenueElement.textContent =
"₹" +
totalRevenue.toLocaleString(
"en-IN",
{
minimumFractionDigits: 2,
maximumFractionDigits: 2
}
);
}

// =============================================
// PENDING PAYMENTS
// =============================================

const pendingPayments =
paymentList.filter(
payment =>
String(
payment.status || ""
).trim().toLowerCase() ===
"pending"
);

const pendingPaymentAmount =
pendingPayments.reduce(
(total, payment) =>
total +
Number(
payment.amount || 0
),
0
);

const pendingElement =
document.getElementById(
"dashboardPendingPayments"
);

if (pendingElement) {
pendingElement.textContent =
"₹" +
pendingPaymentAmount.toLocaleString(
"en-IN",
{
minimumFractionDigits: 2,
maximumFractionDigits: 2
}
);
}

console.log(
"Dashboard data loaded successfully.",
{
customers:
customerCount,

  appointments:
    appointmentCount,

  completedPayments:
    completedPayments.length,

  totalRevenue:
    totalRevenue,

  pendingPayments:
    pendingPayments.length,

  pendingPaymentAmount:
    pendingPaymentAmount
}

);

}

// =====================================================
// DASHBOARD INITIALIZATION
// =====================================================

document.addEventListener(
"DOMContentLoaded",
function () {

if (
  document.getElementById(
    "dashboardRevenue"
  )
) {

  loadDashboardData();

}

}
);
// =====================================================
// DASHBOARD RECENT CUSTOMERS
// =====================================================

async function loadDashboardRecentCustomers() {

if (!supabaseClient) {
console.error("Supabase client not found.");
return;
}

const {
data: {
user
},
error: userError
} = await supabaseClient.auth.getUser();

if (userError || !user) {
console.error("No logged-in user.");
return;
}

const {
data: customers,
error
} = await supabaseClient
.from("customers")
.select(
"id, name, email, created_at"
)
.eq("user_id", user.id)
.order(
"created_at",
{
ascending: false
}
)
.limit(4);

if (error) {

console.error(
  "Dashboard recent customers error:",
  error
);

return;


}

const container =
document.getElementById(
"dashboardRecentCustomers"
);

if (!container) {
return;
}

if (!customers || customers.length === 0) {

container.innerHTML =
  "<p>No customers yet.</p>";

return;


}

container.innerHTML =
customers.map(
customer => {

    const name =
      customer.name ||
      "Customer";

    const email =
      customer.email ||
      "No email";


    const initial =
      name
        .charAt(0)
        .toUpperCase();


    const date =
      customer.created_at
        ? new Date(
            customer.created_at
          ).toLocaleDateString(
            "en-IN",
            {
              day: "numeric",
              month: "short"
            }
          )
        : "";


    return `

      <div class="customer-row">

        <div class="customer-avatar">
          ${initial}
        </div>

        <div>

          <strong>
            ${name}
          </strong>

          <span>
            ${email}
          </span>

        </div>

        <small>
          ${date}
        </small>

      </div>

    `;

  }
).join("");

console.log(
"Recent customers loaded:",
customers.length
);

}

// =====================================================
// LOAD RECENT CUSTOMERS
// =====================================================

document.addEventListener(
"DOMContentLoaded",
function () {

if (
  document.getElementById(
    "dashboardRecentCustomers"
  )
) {

  loadDashboardRecentCustomers();

}

}
);
// =====================================================
// DASHBOARD UPCOMING APPOINTMENTS
// =====================================================

async function loadDashboardUpcomingAppointments() {

if (!supabaseClient) {
console.error("Supabase client not found.");
return;
}

const {
data: {
user
},
error: userError
} = await supabaseClient.auth.getUser();

if (userError || !user) {
console.error("No logged-in user.");
return;
}

const {
data: appointments,
error
} = await supabaseClient
.from("appointments")
.select(
"id, customer_name, service, appointment_date, appointment_time, status"
)
.eq("user_id", user.id)
.order(
"appointment_date",
{
ascending: true
}
)
.order(
"appointment_time",
{
ascending: true
}
)
.limit(4);

if (error) {

console.error(
  "Dashboard appointments error:",
  error
);

return;

}

const container =
document.getElementById(
"dashboardUpcomingAppointments"
);

if (!container) {
return;
}

if (!appointments || appointments.length === 0) {

container.innerHTML =
  "<p>No upcoming appointments.</p>";

return;

}

container.innerHTML =
appointments.map(
appointment => {

    const name =
      appointment.customer_name ||
      "Customer";


    const initial =
      name
        .charAt(0)
        .toUpperCase();


    const service =
      appointment.service ||
      "Appointment";


    let time = "";

    if (appointment.appointment_time) {

      const timeParts =
        appointment.appointment_time
          .split(":");

      const hour =
        Number(
          timeParts[0]
        );

      const minute =
        timeParts[1] || "00";

      const ampm =
        hour >= 12
          ? "PM"
          : "AM";

      const displayHour =
        hour % 12 || 12;

      time =
        `${displayHour}:${minute} ${ampm}`;

    }


    const status =
      appointment.status ||
      "Pending";


    const statusClass =
      String(status)
        .toLowerCase()
        .replace(
          /\s+/g,
          "-"
        );


    return `

      <div class="appointment">

        <div class="appointment-avatar">
          ${initial}
        </div>

        <div class="appointment-info">

          <strong>
            ${name}
          </strong>

          <span>
            ${service} · ${time}
          </span>

        </div>

        <span
          class="appointment-status ${statusClass}"
        >
          ${status}
        </span>

      </div>

    `;

  }
).join("");

console.log(
"Upcoming appointments loaded:",
appointments.length
);

}

// =====================================================
// LOAD UPCOMING APPOINTMENTS
// =====================================================

document.addEventListener(
"DOMContentLoaded",
function () {

if (
  document.getElementById(
    "dashboardUpcomingAppointments"
  )
) {

  loadDashboardUpcomingAppointments();

}

}
);
// =====================================================
// DASHBOARD REVENUE CHART
// =====================================================

function renderDashboardRevenueChart(payments) {

  const chart =
    document.getElementById("dashboardRevenueChart");

  const yAxis =
    document.querySelector(".revenue-panel .chart-y");

  if (!chart) {
    return;
  }

  const months = [
    "Jan", "Feb", "Mar", "Apr",
    "May", "Jun", "Jul", "Aug",
    "Sep", "Oct", "Nov", "Dec"
  ];

  const monthlyRevenue =
    new Array(12).fill(0);


  // -----------------------------------------------------
  // ADD COMPLETED PAYMENTS TO THEIR MONTH
  // -----------------------------------------------------

  (payments || []).forEach(function (payment) {

    const status =
      String(payment.status || "")
        .trim()
        .toLowerCase();

    if (status !== "completed") {
      return;
    }

    if (!payment.payment_date) {
      return;
    }

    const date =
      new Date(payment.payment_date);

    if (isNaN(date.getTime())) {
      return;
    }

    const monthIndex =
      date.getMonth();

    monthlyRevenue[monthIndex] +=
      Number(payment.amount || 0);

  });


  // -----------------------------------------------------
  // FIND MAXIMUM REVENUE
  // -----------------------------------------------------

  const highestRevenue =
    Math.max.apply(
      null,
      monthlyRevenue
    );

  let chartMax = 10000;

  if (highestRevenue > 0) {

    chartMax =
      Math.ceil(
        highestRevenue / 10000
      ) * 10000;

  }

  // Never go below ₹10k
  if (chartMax < 10000) {
    chartMax = 10000;
  }


  // -----------------------------------------------------
  // UPDATE Y AXIS
  // -----------------------------------------------------

  if (yAxis) {

    const step =
      chartMax / 4;

    yAxis.innerHTML = `
      <span>₹${formatChartAmount(chartMax)}</span>
      <span>₹${formatChartAmount(step * 3)}</span>
      <span>₹${formatChartAmount(step * 2)}</span>
      <span>₹${formatChartAmount(step)}</span>
      <span>₹0</span>
    `;
  }


  // -----------------------------------------------------
  // ALWAYS CREATE ALL 12 MONTHS
  // -----------------------------------------------------

  chart.innerHTML = "";

  for (
    let index = 0;
    index < 12;
    index++
  ) {

    const amount =
      monthlyRevenue[index];

    let height = 2;

    if (amount > 0) {

      height =
        (amount / chartMax) * 100;

      if (height < 3) {
        height = 3;
      }

      if (height > 100) {
        height = 100;
      }

    }


    const bar =
      document.createElement("div");

    bar.className =
      "dashboard-bar";

    bar.style.height =
      height + "%";

    bar.title =
      months[index] +
      ": ₹" +
      amount.toLocaleString(
        "en-IN",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }
      );


    const label =
      document.createElement("span");

    label.textContent =
      months[index];

    bar.appendChild(label);

    chart.appendChild(bar);

  }

}


// =====================================================
// CHART AMOUNT FORMATTER
// =====================================================

function formatChartAmount(amount) {

  if (amount >= 100000) {

    return (
      amount / 100000
    ).toFixed(
      amount % 100000 === 0
        ? 0
        : 1
    ) + "L";

  }

  if (amount >= 1000) {

    return (
      amount / 1000
    ).toFixed(
      amount % 1000 === 0
        ? 0
        : 1
    ) + "k";

  }

  return Math.round(amount).toString();

}
