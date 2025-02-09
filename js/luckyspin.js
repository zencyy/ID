const SUPABASE_URL = 'https://htvyyrenzsqbcfjlljmn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0dnl5cmVuenNxYmNmamxsam1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkwMDQ4NjYsImV4cCI6MjA1NDU4MDg2Nn0.8M4tbHeD6Y9Qw_-GrKnGoa63GJQMq1_lObEh2jJjkvA';
let supabase;
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize Supabase client
    let supabaseReady = false;
    let checks = 0;
    while (!supabaseReady && checks < 10) {
        if (window.supabase) {
            // Initialize Supabase client
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            supabaseReady = true;
            console.log("Supabase client initialized after waiting.");
        } else {
            console.log("Supabase not yet loaded, waiting...");
            await new Promise(resolve => setTimeout(resolve, 100));
            checks++;
        }
    }

    // Wheel configuration
    const prizes = ['100 points', '200 points', '500 points', '$5 voucher', '$10 voucher', 'Try again'];
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
    const wheel = document.getElementById('wheel');
    const ctx = wheel.getContext('2d');
    const spinButton = document.getElementById('spinButton');
    const resultElement = document.getElementById('result');
    const spinsRemainingElement = document.getElementById('spinsRemaining');
    const pointsBalanceElement = document.getElementById('pointsBalance');

    // Draw the wheel
    function drawWheel() {
        ctx.clearRect(0, 0, wheel.width, wheel.height);
        const centerX = wheel.width / 2;
        const centerY = wheel.height / 2;
        const radius = wheel.width / 2 - 10;

        for (let i = 0; i < prizes.length; i++) {
            const angle = (i / prizes.length) * 2 * Math.PI;
            const endAngle = ((i + 1) / prizes.length) * 2 * Math.PI;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, angle, endAngle);
            ctx.fillStyle = colors[i];
            ctx.fill();

            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(angle + (1 / prizes.length) * Math.PI);
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.fillText(prizes[i], radius / 2, 0);
            ctx.restore();
        }
    }

    // Spin the wheel
    async function spinWheel() {
        spinButton.disabled = true;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert('Please log in to spin the wheel');
            spinButton.disabled = false;
            return;
        }
    
        try {
            const { data, error } = await supabase.rpc('process_spin', { user_id: user.id });
            if (error) throw error;
    
            if (data.success) {
                const prizeIndex = prizes.indexOf(data.prize);
                const rotation = 2 * Math.PI * (prizeIndex / prizes.length + Math.random());
                animateWheel(rotation, () => {
                    resultElement.textContent = `You won: ${data.prize}`;
                    if (data.voucher_code) {
                        resultElement.textContent += ` (Voucher Code: ${data.voucher_code})`;
                        localStorage.setItem('lastWonVoucher', JSON.stringify({
                            code: data.voucher_code,
                            amount: data.voucher_amount
                        }));
                    } else if (data.points) {
                        resultElement.textContent += ` (${data.points} points added to your balance)`;
                    }
                    updateUserProfile();
                });
            } else {
                resultElement.textContent = data.message;
            }
        } catch (error) {
            console.error('Error processing spin:', error);
            resultElement.textContent = 'An error occurred. Please try again.';
        } finally {
            spinButton.disabled = false;
        }
    }

    // Animate the wheel spinning
    function animateWheel(targetRotation, callback) {
        let currentRotation = 0;
        const animationDuration = 5000; // 5 seconds
        const startTime = performance.now();

        function animate(currentTime) {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / animationDuration, 1);
            currentRotation = targetRotation * easeOutCubic(progress);

            ctx.save();
            ctx.translate(wheel.width / 2, wheel.height / 2);
            ctx.rotate(currentRotation);
            ctx.translate(-wheel.width / 2, -wheel.height / 2);
            drawWheel();
            ctx.restore();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                callback();
            }
        }

        requestAnimationFrame(animate);
    }

    // Easing function for smooth animation
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    // Update user profile (points and spins remaining)
    async function updateUserProfile() {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: pointsData, error: pointsError } = await supabase
                .from('loyalty_points')
                .select('points_balance')
                .eq('user_id', user.id)
                .maybeSingle();

            if (!pointsError) {
                pointsBalanceElement.textContent = pointsData ? pointsData.points_balance : '0';
            } else {
                console.error('Error fetching points:', pointsError);
            }

            const { data: spinsData, error: spinsError } = await supabase
                .from('spin_history')
                .select('id')
                .eq('user_id', user.id)
                .gte('spin_date', new Date().toISOString().split('T')[0]);

            if (!spinsError) {
                spinsRemainingElement.textContent = Math.max(0, 3 - (spinsData?.length || 0));
            } else {
                console.error('Error fetching spins:', spinsError);
            }
        }
    }

    // Initialize the wheel and event listeners
    drawWheel();
    spinButton.addEventListener('click', spinWheel);
    updateUserProfile();
});
