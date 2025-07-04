// JavaScript untuk interaktivitas
document.addEventListener('DOMContentLoaded', function() {
    // Variabel untuk keranjang belanja
    let selectedSeat = null;
    let pendingMovie = null;
    let cart = [];
    let cartCount = 0;
    let cartTotal = 0;
    
    // Elemen DOM
    const bookedSeats = ['A1', 'B3', 'A5'];
    const cartContainer = document.querySelector('.cart-container');
    const cartSidebar = document.querySelector('.cart-sidebar');
    const closeCartBtn = document.querySelector('.close-cart');
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartTotalElement = document.querySelector('.cart-total span');
    const cartCountElement = document.querySelector('.cart-count');
    const checkoutBtn = document.querySelector('.checkout-btn');
    const scheduleModal = document.querySelector('.schedule-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const scheduleGrid = document.querySelector('.schedule-grid');
    const paymentModal = document.querySelector('.payment-modal');
    const closePaymentBtn = document.querySelector('.close-payment');
    const paymentOptions = document.querySelectorAll('.payment-option');
    const movieDetailsModal = document.querySelector('.movie-details-modal');
    const closeMovieDetailsBtn = document.querySelector('.close-movie-details');
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    const seatModal = document.querySelector('.seat-modal');
    const seatGrid = document.querySelector('.seat-grid');
    const closeSeatModalBtn = document.querySelector('.close-seat-modal');
    const confirmSeatBtn = document.querySelector('.confirm-seat-btn');
    
    // Data jadwal contoh
    const schedules = [
        { time: '10:00', price: 45000 },
        { time: '12:30', price: 50000 },
        { time: '15:00', price: 50000 },
        { time: '17:30', price: 55000 },
        { time: '20:00', price: 60000 },
        { time: '22:30', price: 55000 }
    ];
    
    // Buka/tutup keranjang
    cartContainer.addEventListener('click', function() {
        cartSidebar.classList.add('active');
    });
    
    closeCartBtn.addEventListener('click', function() {
        cartSidebar.classList.remove('active');
    });
    
    // Buka modal jadwal
    document.querySelectorAll('.schedule-btn, .add-to-cart, .movie-details-actions').forEach(btn => {
    btn.addEventListener('click', function() {
        // Ambil elemen movie-card terdekat
        const movieCard = this.closest('.movie-card');
        const movieId = movieCard.getAttribute('data-movie-id');
        const movieTitle = movieCard.querySelector('.movie-title').textContent;

        // Tampilkan daftar jadwal
        scheduleGrid.innerHTML = '';
        schedules.forEach(schedule => {
            const scheduleItem = document.createElement('div');
            scheduleItem.className = 'schedule-item';
            scheduleItem.innerHTML = `
                <div class="schedule-time">${schedule.time}</div>
                <div class="schedule-price">Rp ${schedule.price.toLocaleString()}</div>
            `;

            scheduleItem.addEventListener('click', function() {
                pendingMovie = {
                    id: movieId,
                    title: movieTitle,
                    time: schedule.time,
                    price: schedule.price
                };
                scheduleModal.classList.remove('active');
                showSeatModal();
            });

            scheduleGrid.appendChild(scheduleItem);
        });

        scheduleModal.classList.add('active');
    });
});

function openScheduleForMovie(movieId, movieTitle) {
    scheduleGrid.innerHTML = '';
    schedules.forEach(schedule => {
        const scheduleItem = document.createElement('div');
        scheduleItem.className = 'schedule-item';
        scheduleItem.innerHTML = `
            <div class="schedule-time">${schedule.time}</div>
            <div class="schedule-price">Rp ${schedule.price.toLocaleString()}</div>
        `;

        scheduleItem.addEventListener('click', function () {
            pendingMovie = {
                id: movieId,
                title: movieTitle,
                time: schedule.time,
                price: schedule.price
            };

            scheduleModal.classList.remove('active');
            showSeatModal(); // ⬅️ Pastikan ini tersedia
        });

        scheduleGrid.appendChild(scheduleItem);
    });

    scheduleModal.classList.add('active');
}

// Fungsi tampilkan modal kursi
function showSeatModal() {
    seatGrid.innerHTML = '';
    selectedSeat = null;

    const seats = ['A1','A2','A3','A4','A5','B1','B2','B3','B4','B5'];

    seats.forEach(seat => {
        const seatDiv = document.createElement('div');
        seatDiv.className = 'seat';
        seatDiv.textContent = seat;

        // Tandai kursi yang sudah dipesan
        if (bookedSeats.includes(seat)) {
            seatDiv.classList.add('occupied');
        } else {
            seatDiv.addEventListener('click', () => {
                document.querySelectorAll('.seat').forEach(s => s.classList.remove('selected'));
                seatDiv.classList.add('selected');
                selectedSeat = seat;
            });
        }

        seatGrid.appendChild(seatDiv);
    });


    seatModal.classList.add('active');
}

// Konfirmasi kursi
confirmSeatBtn.addEventListener('click', () => {
    if (!selectedSeat || !pendingMovie) {
        alert('Pilih kursi terlebih dahulu!');
        return;
    }

    addToCart(
        `${pendingMovie.id}-${selectedSeat}`,
        `${pendingMovie.title} - Kursi ${selectedSeat}`,
        pendingMovie.time,
        pendingMovie.price,
        'movie'
    );

    seatModal.classList.remove('active');
    pendingMovie = null;
    selectedSeat = null;
});

closeSeatModalBtn.addEventListener('click', () => {
    seatModal.classList.remove('active');
});
    
    // Tutup modal jadwal
    closeModalBtn.addEventListener('click', function() {
        scheduleModal.classList.remove('active');
    });
    
    // Tambahkan ke keranjang
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.movie-card, .food-card');
            const isMovie = card.classList.contains('movie-card');
            
            if (isMovie) {
                const movieId = card.getAttribute('data-movie-id');
                const movieTitle = card.querySelector('.movie-title').textContent;
                const moviePrice = parseInt(card.querySelector('.movie-meta:last-child').textContent.replace(/\D/g, ''));
                
                // Default schedule for quick add
                addToCart(movieId, movieTitle, '14:00', moviePrice, 'movie');
            } else {
                const foodId = card.getAttribute('data-food-id');
                const foodName = card.querySelector('.food-name').textContent;
                const foodPrice = parseInt(card.querySelector('.food-price').textContent.replace(/\D/g, ''));
                
                addToCart(foodId, foodName, null, foodPrice, 'food');
            }
        });
    });
    
    // Fungsi tambah ke keranjang
    function addToCart(id, name, schedule, price, type) {
        const existingItem = cart.find(item => item.id === id && item.schedule === schedule);
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                id,
                name,
                schedule,
                price,
                type,
                quantity: 1
            });
        }
        
        updateCart();
        cartSidebar.classList.add('active');
    }
    
    // Update keranjang
    function updateCart() {
        cartItemsContainer.innerHTML = '';
        cartCount = 0;
        cartTotal = 0;
        
        cart.forEach(item => {
            cartCount += item.quantity;
            cartTotal += item.price * item.quantity;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${getItemImage(item)}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h3 class="cart-item-title">${item.name}</h3>
                    <p class="cart-item-price">Rp ${item.price.toLocaleString()}</p>
                    ${item.schedule ? `<p class="cart-item-schedule"><span class="material-icons">schedule</span>${item.schedule}</p>` : ''}
                    <div class="cart-item-actions">
                        <button class="quantity-btn minus" data-id="${item.id}" data-schedule="${item.schedule}">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus" data-id="${item.id}" data-schedule="${item.schedule}">+</button>
                        <button class="remove-item" data-id="${item.id}" data-schedule="${item.schedule}"><span class="material-icons">delete</span></button>
                    </div>
                </div>
            `;
            
            cartItemsContainer.appendChild(cartItem);
        });
        
        cartCountElement.textContent = cartCount;
        cartTotalElement.textContent = `Rp ${cartTotal.toLocaleString()}`;
        
        // Tambahkan event listener untuk tombol quantity dan hapus
        document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const schedule = this.getAttribute('data-schedule');
                updateQuantity(id, schedule, -1);
            });
        });
        
        document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const schedule = this.getAttribute('data-schedule');
                updateQuantity(id, schedule, 1);
            });
        });
        
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const schedule = this.getAttribute('data-schedule');
                removeItem(id, schedule);
            });
        });
    }
    
    // Fungsi helper untuk mendapatkan gambar item
    function getItemImage(item) {
        if (item.type === 'movie') {
            const baseId = item.id.split('-')[0];
            const movieCard = document.querySelector(`.movie-card[data-movie-id="${baseId}"]`);
            return movieCard ? movieCard.querySelector('.movie-poster').src : '';
        } else {
            return document.querySelector(`.food-card[data-food-id="${item.id}"] .food-image`).src;
        }
    }
    
    // Update quantity item
    function updateQuantity(id, schedule, change) {
        const item = cart.find(item => item.id === id && item.schedule === schedule);
        
        if (item) {
            item.quantity += change;
            
            if (item.quantity <= 0) {
                cart = cart.filter(i => !(i.id === id && i.schedule === schedule));
            }
            
            updateCart();
        }
    }
    
    // Hapus item
    function removeItem(id, schedule) {
        cart = cart.filter(item => !(item.id === id && item.schedule === schedule));
        updateCart();
    }
    
    // Checkout
    checkoutBtn.addEventListener('click', function() {
        if (cart.length === 0) {
            alert('Keranjang belanja kosong!');
            return;
        }
        
        paymentModal.classList.add('active');
        document.querySelector('.payment-details strong').textContent = `Rp ${cartTotal.toLocaleString()}`;
    });
    
    // Tutup modal pembayaran
    closePaymentBtn.addEventListener('click', function() {
        paymentModal.classList.remove('active');
    });
    
    // Pilih metode pembayaran
    paymentOptions.forEach(option => {
        option.addEventListener('click', function() {
            paymentOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    
    // Konfirmasi pembayaran
    document.querySelector('.confirm-payment').addEventListener('click', function() {
        alert('Pembayaran berhasil! Tiket dan makanan akan dikirim ke email Anda.');
        cart = [];
        updateCart();
        paymentModal.classList.remove('active');
        cartSidebar.classList.remove('active');
    });
    
    // Buka detail film
    document.querySelectorAll('.movie-card').forEach(card => {
        card.addEventListener('click', function(e) {
            // Pastikan yang diklik bukan tombol
            if (!e.target.closest('button')) {
                const movieId = this.getAttribute('data-movie-id');
                showMovieDetails(movieId);
            }
        });
    });
    
    // Fungsi tampilkan detail film
    function showMovieDetails(movieId) {
        const movieCard = document.querySelector(`.movie-card[data-movie-id="${movieId}"]`);
        const poster = movieCard.querySelector('.movie-poster').src;
        const title = movieCard.querySelector('.movie-title').textContent;
        const meta = movieCard.querySelectorAll('.movie-meta');
        const genreRuntime = meta[0].textContent;
        const price = meta[1].textContent;
        
        // Update modal dengan data film
        document.querySelector('.movie-details-poster').src = poster;
        document.querySelector('.movie-details-title').textContent = title;
        
        // Split genre and runtime
        const [genre, runtime] = genreRuntime.split(' | ');
        
        // Update meta info
        const year = new Date().getFullYear(); // Asumsi tahun rilis adalah tahun ini
        document.querySelector('.movie-details-meta').innerHTML = `
            <span>${year}</span>
            <span>${genre}</span>
            <span>${runtime}</span>
            <div class="movie-details-rating">
                <span class="material-icons">star</span>
                <span>${(Math.random() * 3 + 7).toFixed(1)}/10</span>
            </div>
        `;
        
        // Update synopsis (dummy text)
        document.querySelector('.movie-details-synopsis p').textContent = 
            `Film ${title} menceritakan petualangan seru yang penuh dengan aksi dan drama. ${title} harus menghadapi berbagai tantangan untuk mencapai tujuannya. Film ini disutradarai oleh sutradara ternama dan dibintangi oleh aktor-aktor papan atas.`;
        
        // Update tombol aksi
        document.querySelector('.movie-details-actions').addEventListener('click', function() {
            openScheduleForMovie(movieId, title);
            movieDetailsModal.classList.remove('active');
        });
                
        movieDetailsModal.classList.add('active');
    }
    
    // Tutup modal detail film
    closeMovieDetailsBtn.addEventListener('click', function() {
        movieDetailsModal.classList.remove('active');
    });
    
    // Tab arsip film
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Update active content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
        });
    });
    
    // Tutup modal saat klik di luar
        window.addEventListener('click', function(e) {
        if (e.target === scheduleModal) scheduleModal.classList.remove('active');
        if (e.target === paymentModal) paymentModal.classList.remove('active');
        if (e.target === movieDetailsModal) movieDetailsModal.classList.remove('active');
        if (e.target === seatModal) seatModal.classList.remove('active');
    });
});
