(() => {
    'use strict';

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation');

    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }

            form.classList.add('was-validated');
        }, false);
    });
})();

function togglePasswordVisibility() {
    var passwordInput = document.getElementById('password');
    var eyeToggle = document.getElementById('eye-toggle');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeToggle.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
    } else {
        passwordInput.type = 'password';
        eyeToggle.innerHTML = '<i class="fa-solid fa-eye"></i>';
    }
}

// Get references to the buttons and the side panel
const openBtn = document.getElementById("openBtn");
const closeBtn = document.getElementById("closeBtn");
const sidePanel = document.getElementById("sidePanel");

// Function to open the side panel
function openSidePanel() {
  sidePanel.classList.add("open");
}

// Function to close the side panel
function closeSidePanel() {
  sidePanel.classList.remove("open");
}

// Add event listeners to the buttons
openBtn.addEventListener("click", openSidePanel);
closeBtn.addEventListener("click", closeSidePanel);

// Function to open the popup
function openPopup() {
    var popup = document.getElementById("popup");
    popup.style.display = "block";
  }
  
  // Function to close the popup
  function closePopup() {
    var popup = document.getElementById("popup");
    popup.style.display = "none";
  }
  
  // Event listener to open the popup when the button is clicked
  document.getElementById("openButton").addEventListener("click", openPopup);
  
  document.addEventListener('DOMContentLoaded', function() {
    const checkbox = document.querySelector('.taxes');
    const rupeeSymbolElements = document.querySelectorAll('.rupee-symbol');
  
    if (checkbox) {
      checkbox.addEventListener('change', updatePriceDisplay);
    }
  
    function updatePriceDisplay() {
      const isChecked = checkbox.checked;
  
      rupeeSymbolElements.forEach(element => {
        const priceValue = parseFloat(element.dataset.price);
        if (!isNaN(priceValue)) {
          const updatedPrice = isChecked ? (priceValue * 1.18).toLocaleString('en-IN') : priceValue.toLocaleString('en-IN');
          element.textContent = `₹ ${updatedPrice} /night${isChecked ? ' (including 18% GST)' : ''}`;
        } else {
          element.textContent = 'Price not available';
        }
      });
    }
  
    updatePriceDisplay(); // Initial update
  });

  document.addEventListener('DOMContentLoaded', function() {
    const checkbox = document.getElementById('flexSwitchCheckChecked');
    console.log('Checkbox:', checkbox); // Check if checkbox is null

    if (checkbox) {
        checkbox.addEventListener('change', updatePriceDisplay);
        console.log('Checkbox event listener added successfully.');
    } else {
        console.error('Checkbox element not found!');
    }

    function updatePriceDisplay() {
        const rupeeSymbolElements = document.querySelectorAll('.rupee-symbol');
        rupeeSymbolElements.forEach(element => {
            const priceValue = parseFloat(element.dataset.price);
            const isChecked = checkbox.checked;
            if (!isNaN(priceValue)) {
                const updatedPrice = isChecked ? (priceValue * 1.18).toLocaleString('en-IN') : priceValue.toLocaleString('en-IN');
                element.textContent = `₹ ${updatedPrice} /night${isChecked ? ' (including 18% GST)' : ''}`;
            } else {
                element.textContent = 'Price not available';
            }
        });
    }

    updatePriceDisplay(); // Initial update
    console.log('Script loaded and initialized successfully.');
});

function toggleReviewsVisibility() {
  const hiddenReviews = document.querySelectorAll('.review.hidden');
  hiddenReviews.forEach((review, index) => {
    if (index < visibleCount) {
      review.classList.remove('hidden'); // Remove the 'hidden' class to show the review
    } else {
      review.classList.add('hidden'); // Add the 'hidden' class to hide the review
    }
  });
  
  if (visibleCount >= hiddenReviews.length) {
    showMoreBtn.style.display = 'none'; // Hide button when all reviews are visible
  } else {
    showMoreBtn.style.display = 'block'; // Show button when there are more reviews to display
  }
}
  
window.addEventListener('scroll', function() {
  var containElement = document.querySelector('.contain');
  var fixedBox = document.getElementById('fixedBox');

  // Calculate the distance between the top of the contain element and the top of the viewport
  var containTop = containElement.getBoundingClientRect().top;

  // If the contain element is in the viewport or below it, show/hide the fixed-box
  if (containTop <= window.innerHeight) {
    fixedBox.style.display = 'block';
  } else {
    fixedBox.style.display = 'none';
  }
});

  