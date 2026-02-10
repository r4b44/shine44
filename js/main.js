
(function () {
    'use strict';


    const navbar = document.getElementById('mainNav');

    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });


    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));

            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });

                const navbarCollapse = document.querySelector('.navbar-collapse');
                if (navbarCollapse.classList.contains('show')) {
                    const navbarToggler = document.querySelector('.navbar-toggler');
                    navbarToggler.click();
                }
            }
        });
    });

    const statsSection = document.querySelector('.stats-section');
    let statsAnimated = false;

    function animateStats() {
        const statNumbers = document.querySelectorAll('.stat-number');

        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'));
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    stat.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    stat.textContent = target;
                }
            };

            updateCounter();
        });
    }

    const observerOptions = {
        threshold: 0.5
    };

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !statsAnimated) {
                animateStats();
                statsAnimated = true;
            }
        });
    }, observerOptions);

    if (statsSection) {
        statsObserver.observe(statsSection);
    }


    let selectedVehicleType = null;
    let selectedVehicleMultiplier = 1;
    const selectedServices = new Map();

    const vehicleTypes = document.querySelectorAll('.vehicle-type');

    vehicleTypes.forEach(type => {
        type.addEventListener('click', function () {
            vehicleTypes.forEach(t => t.classList.remove('selected'));

            this.classList.add('selected');

            selectedVehicleType = this.getAttribute('data-type');
            selectedVehicleMultiplier = parseFloat(this.getAttribute('data-multiplier'));

            updateVehicleSummary(this.querySelector('h4').textContent);
            updateServicesSummary();
            updateTotalPrice();
        });
    });

    const serviceCheckboxes = document.querySelectorAll('.service-checkbox');

    serviceCheckboxes.forEach(checkboxWrapper => {
        const checkbox = checkboxWrapper.querySelector('input[type="checkbox"]');
        const label = checkboxWrapper.querySelector('label');

        checkboxWrapper.addEventListener('click', function (e) {
            if (e.target !== checkbox) {
                e.preventDefault();
                checkbox.checked = !checkbox.checked;
                checkbox.dispatchEvent(new Event('change'));
            }
        });

        checkbox.addEventListener('change', function () {
            const serviceId = this.id;
            const serviceName = label.querySelector('.service-name').textContent;
            const basePrice = parseInt(this.getAttribute('data-price'));

            if (this.checked) {
                selectedServices.set(serviceId, {
                    name: serviceName,
                    basePrice: basePrice
                });
                checkboxWrapper.style.background = 'rgba(220, 20, 60, 0.1)';
                checkboxWrapper.style.borderColor = '#dc143c';
            } else {
                selectedServices.delete(serviceId);
                checkboxWrapper.style.background = '';
                checkboxWrapper.style.borderColor = '';
            }

            updateServicesSummary();
            updateTotalPrice();
        });
    });

    const nextStepBtn = document.getElementById('nextStep');
    const prevStepBtn = document.getElementById('prevStep');
    let currentStep = 1;

    if (nextStepBtn) {
        nextStepBtn.addEventListener('click', function () {
            if (currentStep === 1) {
                if (!selectedVehicleType) {
                    alert('Proszę wybrać rozmiar pojazdu');
                    return;
                }
                currentStep = 2;
                showStep(currentStep);
            }
        });
    }

    if (prevStepBtn) {
        prevStepBtn.addEventListener('click', function () {
            if (currentStep === 2) {
                currentStep = 1;
                showStep(currentStep);
            }
        });
    }

    function showStep(step) {
        document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
        document.querySelector(`.form-step[data-step="${step}"]`).classList.add('active');

        if (step === 1) {
            prevStepBtn.style.display = 'none';
            nextStepBtn.innerHTML = 'Dalej <i class="fas fa-arrow-right"></i>';
        } else {
            prevStepBtn.style.display = 'inline-block';
            nextStepBtn.innerHTML = 'Gotowe <i class="fas fa-check"></i>';
        }
    }

    function updateVehicleSummary(vehicleName) {
        const vehicleSummary = document.getElementById('selectedVehicle');
        vehicleSummary.textContent = vehicleName;
    }

    function updateServicesSummary() {
        const servicesList = document.getElementById('selectedServices');
        servicesList.innerHTML = '';

        if (selectedServices.size === 0) {
            servicesList.innerHTML = '<li class="empty-state">Brak wybranych usług</li>';
            return;
        }

        selectedServices.forEach((service, id) => {
            const price = Math.round(service.basePrice * selectedVehicleMultiplier);
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${service.name}</span>
                <span>${price} zł</span>
            `;
            servicesList.appendChild(li);
        });
    }

    function updateTotalPrice() {
        let total = 0;
        selectedServices.forEach(service => {
            total += service.basePrice * selectedVehicleMultiplier;
        });

        const totalPriceElement = document.getElementById('totalPrice');
        if (!totalPriceElement) return;

        const roundedTotal = Math.round(total);
        const currentPrice = parseInt(totalPriceElement.textContent.replace(/\D/g, '')) || 0;

        if (Math.abs(roundedTotal - currentPrice) < 10) {
            totalPriceElement.textContent = roundedTotal + ' zł';
        } else {
            animateValue(totalPriceElement, currentPrice, roundedTotal, 500);
        }
    }

    function animateValue(element, start, end, duration) {
        if (!element) return;

        if (start === end) {
            element.textContent = end + ' zł';
            return;
        }

        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                current = end;
                clearInterval(timer);
            }
            element.textContent = Math.round(current) + ' zł';
        }, 16);
    }

    const bookFromCalculatorBtn = document.getElementById('bookFromCalculator');

    if (bookFromCalculatorBtn) {
        bookFromCalculatorBtn.addEventListener('click', function (e) {
            e.preventDefault();

            if (selectedServices.size === 0) {
                alert('Proszę wybrać przynajmniej jedną usługę w kalkulatorze');
                return;
            }

            let servicesText = '';
            let totalPrice = 0;
            selectedServices.forEach((service, id) => {
                const price = Math.round(service.basePrice * selectedVehicleMultiplier);
                servicesText += `- ${service.name}: ${price} zł\n`;
                totalPrice += price;
            });

            const messageField = document.getElementById('message');
            if (messageField) {
                const vehicleType = selectedVehicleType || 'nie wybrano';
                messageField.value = `Wycena z kalkulatora:\n\nTyp pojazdu: ${vehicleType}\n\nWybrane usługi:\n${servicesText}\nŁączna szacowana cena: ${totalPrice} zł\n\n`;
            }

            document.getElementById('booking').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    const bookingForm = document.getElementById('bookingForm');

    if (bookingForm) {
        bookingForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wysyłanie...';

            const formData = new FormData();
            formData.append('name', document.getElementById('name').value);
            formData.append('phone', document.getElementById('phone').value);
            formData.append('email', document.getElementById('email').value);
            formData.append('vehicle', document.getElementById('vehicle').value);
            formData.append('service', document.getElementById('service').value);
            formData.append('date', document.getElementById('date').value);
            formData.append('message', document.getElementById('message').value);

            fetch('https://formspree.io/f/xvzznzgp', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        return response.json().then(data => { throw new Error(data.error || 'Błąd serwera') });
                    }
                })
                .then(data => {
                    alert('Dziękujemy! Twoje zapytanie zostało wysłane. Skontaktujemy się z Tobą w ciągu 24 godzin.');
                    bookingForm.reset();
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Wystąpił problem z wysyłką. Upewnij się, że formularz jest aktywowany w Formspree lub zadzwoń: +48 123 456 789');
                })
                .finally(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                });
        });
    }

    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.service-card, .gallery-item, .contact-card');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '0';
                    entry.target.style.transform = 'translateY(30px)';

                    setTimeout(() => {
                        entry.target.style.transition = 'all 0.6s ease';
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, 100);

                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });

        elements.forEach(el => observer.observe(el));
    };

    const scrollTopBtn = document.getElementById('scrollTop');

    if (scrollTopBtn) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 500) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });

        scrollTopBtn.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    const heroSection = document.querySelector('.hero-section');

    if (heroSection) {
        window.addEventListener('scroll', function () {
            const scrolled = window.scrollY;
            const parallaxSpeed = 0.5;

            if (scrolled < window.innerHeight) {
                heroSection.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
            }
        });
    }

    const galleryItems = document.querySelectorAll('.gallery-item');
    const modal = document.getElementById('galleryModal');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalVehicle = document.getElementById('modalVehicle');
    const modalServices = document.getElementById('modalServices');
    const modalTime = document.getElementById('modalTime');
    const closeModal = document.querySelector('.gallery-modal-close');
    const modalBookingBtn = document.querySelector('.modal-booking-btn');

    let currentGalleryTitle = '';
    let currentGalleryVehicle = '';
    let currentGalleryServices = '';

    galleryItems.forEach(item => {
        item.addEventListener('click', function () {
            const image = this.getAttribute('data-image');
            const title = this.getAttribute('data-title');
            const vehicle = this.getAttribute('data-vehicle');
            const services = this.getAttribute('data-services').split(',');
            const time = this.getAttribute('data-time');

            currentGalleryTitle = title;
            currentGalleryVehicle = vehicle;
            currentGalleryServices = services.map(s => s.trim()).join(', ');

            modalImage.src = image;
            modalImage.alt = `${title} - ${vehicle}`;
            modalTitle.textContent = title;
            modalVehicle.textContent = vehicle;
            modalTime.textContent = time;

            modalServices.innerHTML = services.map(service =>
                `<li>${service.trim()}</li>`
            ).join('');

            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    function closeGalleryModal() {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    if (closeModal) {
        closeModal.addEventListener('click', closeGalleryModal);
    }

    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                closeGalleryModal();
            }
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeGalleryModal();
        }
    });

    if (modalBookingBtn) {
        modalBookingBtn.addEventListener('click', function (e) {
            e.preventDefault();

            closeGalleryModal();

            const vehicleField = document.getElementById('vehicle');
            const messageField = document.getElementById('message');

            if (vehicleField) {
                vehicleField.value = currentGalleryVehicle;
            }

            if (messageField) {
                messageField.value = `Chciałbym umówić wizytę na usługę: ${currentGalleryTitle}\n\nUsługi do wykonania:\n${currentGalleryServices}\n\n`;
            }

            setTimeout(() => {
                document.getElementById('booking').scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 300);
        });
    }

    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');

        inputs.forEach(input => {
            input.addEventListener('blur', function () {
                if (!this.value) {
                    this.style.borderColor = '#dc3545';
                } else {
                    this.style.borderColor = '#28a745';
                }
            });

            input.addEventListener('input', function () {
                if (this.value) {
                    this.style.borderColor = '#28a745';
                }
            });
        });
    });

    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const navbarCollapse = document.querySelector('.navbar-collapse');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 992 && navbarCollapse.classList.contains('show')) {
                const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
                    toggle: true
                });
            }
        });
    });

    function loadPromotions() {
        const promotions = JSON.parse(localStorage.getItem('promotions') || '[]');
        const container = document.getElementById('promotionsContainer');

        if (!container) return;

        if (promotions.length === 0) {
            container.innerHTML = `
                <div class="no-promotions" style="text-align: center; padding: 3rem; color: #6c757d;">
                    <i class="fas fa-tag" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <p>Brak aktualnych promocji. Wróć wkrótce!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = promotions.map(promo => `
            <div class="promotion-card">
                ${promo.badge ? `<div class="promotion-badge">${promo.badge}</div>` : ''}
                <img src="${promo.image}" alt="${promo.title}" class="promotion-image">
                <div class="promotion-content">
                    <h3 class="promotion-title">${promo.title}</h3>
                    <p class="promotion-description">${promo.description}</p>
                    <div class="promotion-footer">
                        <div class="promotion-price">
                            ${promo.oldPrice ? `<span class="promotion-old-price">${promo.oldPrice} zł</span>` : ''}
                            <span class="promotion-new-price">${promo.newPrice} zł</span>
                        </div>
                        <a href="#booking" class="promotion-btn">Rezerwuj</a>
                    </div>
                </div>
            </div>
        `).join('');
    }

    window.addEventListener('load', function () {
        document.body.style.opacity = '0';
        setTimeout(() => {
            document.body.style.transition = 'opacity 0.5s ease';
            document.body.style.opacity = '1';
        }, 100);

        animateOnScroll();

        loadPromotions();
    });

    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', function () {
        const scrollY = window.scrollY;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.navbar-nav a[href="#${sectionId}"]`);

            if (navLink && scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                navLink.classList.add('active');
            }
        });
    });


    const yearElement = document.querySelector('.footer-bottom p');
    if (yearElement) {
        const currentYear = new Date().getFullYear();
        yearElement.innerHTML = yearElement.innerHTML.replace('2024', currentYear);
    }

    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[data-src]');

        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    }

    document.addEventListener('keydown', function (e) {
        if (document.querySelector('.calculator-form')) {
            if (e.key === 'ArrowRight' && nextStepBtn) {
                nextStepBtn.click();
            }
            if (e.key === 'ArrowLeft' && prevStepBtn) {
                prevStepBtn.click();
            }
        }
    });

    window.addEventListener('beforeprint', function () {
        document.body.classList.add('printing');
    });

    window.addEventListener('afterprint', function () {
        document.body.classList.remove('printing');
    });

})();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
    });
}
