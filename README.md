# Lagrangian Double Pendulum

I wanted to explore how relatively simple equations of motion can produce chaotic behavior in a nonlinear system. I used the Lagrangian formalism to derive and simplify the equations of motion.

The system consists of a planar double pendulum with two point masses. A massless rod of length \(l_1\) is attached to a fixed pivot and carries a mass \(m_1\) at its end. A second massless rod of length \(l_2\) is attached to the first mass and carries a mass \(m_2\) at its end. Both rods are free to rotate in a plane, and the motion is constrained to two dimensions.

The double pendulum is a classic nonlinear system because even slight changes in the initial conditions can produce vastly different trajectories. Furthermore, its equations of motion generally do not admit a closed-form solution, making it an ideal system to study computationally.

---

## Generalized Coordinates

I chose the angles the rods make with the vertical as my generalized coordinates:

* \(\theta_1\): angle of the first rod
* \(\theta_2\): angle of the second rod

Their time derivatives are:

* \(\omega_1 = d\theta_1/dt\)
* \(\omega_2 = d\theta_2/dt\)

and their second derivatives are:

* \(\alpha_1 = d^2\theta_1/dt^2\)
* \(\alpha_2 = d^2\theta_2/dt^2\)

I chose angular coordinates instead of Cartesian coordinates because they already encode the constraints of the system; each mass remains a fixed distance from its corresponding pivot. Using Cartesian coordinates would require additional constraint equations, making the derivation significantly more cumbersome.

---

## Kinematics and Kinetic Energy

The Cartesian position of the first mass is

$$
x_1 = l_1\sin(\theta_1)
$$

$$
y_1 = -l_1\cos(\theta_1)
$$

The position of the second mass is

$$
x_2 = l_1\sin(\theta_1) + l_2\sin(\theta_2)
$$

$$
y_2 = -l_1\cos(\theta_1) - l_2\cos(\theta_2)
$$

Differentiating these expressions gives the velocities of the two masses. The total kinetic energy is

$$
T = \frac{1}{2}m_1v_1^2+\frac{1}{2}m_2v_2^2
$$

which expands to

$$
T =
\frac{1}{2}m_1l_1^2\omega_1^2
+
\frac{1}{2}m_2
\left(
l_1^2\omega_1^2
+
l_2^2\omega_2^2
+
2l_1l_2\omega_1\omega_2
\cos(\theta_1-\theta_2)
\right).
$$

The cross term,

$$
2l_1l_2\omega_1\omega_2\cos(\theta_1-\theta_2),
$$

appears because the velocity of the second mass depends on the motion of both rods. When the velocity components are squared, products involving both angular velocities naturally appear. Physically, this reflects that the two degrees of freedom are dynamically coupled rather than independent.

---

## Potential Energy

Choosing the zero of potential energy at the equilibrium position, the gravitational potential energy is

$$
V =
m_1gl_1(1-\cos(\theta_1))
+
m_2g
\left[
l_1(1-\cos(\theta_1))
+
l_2(1-\cos(\theta_2))
\right].
$$

The particular choice of zero for potential energy is arbitrary; shifting the potential by a constant does not affect the equations of motion because the generalized forces depend on derivatives of the potential.

---

## Lagrangian

The Lagrangian is defined as

$$
L = T - V.
$$

Substituting the expressions for kinetic and potential energy gives a Lagrangian that depends on \(\theta_1,\theta_2,\omega_1,\) and \(\omega_2\).

---

## Equations of Motion

Using the Euler–Lagrange equations,

$$
\frac{d}{dt}
\left(
\frac{\partial L}{\partial \dot{\theta_i}}
\right)
-
\frac{\partial L}{\partial \theta_i}
=0,
$$

for \(i=1,2\), we obtain two coupled second-order differential equations.

After simplifying and collecting the terms involving the angular accelerations, the equations can be written in the form

$$
\boxed{
M\boldsymbol{\alpha}=\mathbf F
}
$$

where

$$
\boldsymbol{\alpha}
=
\begin{bmatrix}
\alpha_1\\
\alpha_2
\end{bmatrix}.
$$

For this system,

$$
M=
\begin{bmatrix}
(m_1+m_2)l_1^2 &
m_2l_1l_2\cos(\theta_1-\theta_2)\\
m_2l_1l_2\cos(\theta_1-\theta_2) &
m_2l_2^2
\end{bmatrix}
$$

and

$$
\mathbf F=
\begin{bmatrix}
X\\
Y
\end{bmatrix},
$$

where

$$
X=
-(m_1+m_2)gl_1\sin(\theta_1)
-
m_2l_1l_2\omega_2^2
\sin(\theta_1-\theta_2)
$$

and

$$
Y=
m_2l_1l_2\omega_1^2
\sin(\theta_1-\theta_2)
-
m_2gl_2\sin(\theta_2).
$$

The diagonal entries of \(M\) represent the rotational inertia associated with each generalized coordinate, while the off-diagonal entries arise from the kinetic-energy cross term and represent the coupling between the two angular coordinates.

To solve for the angular accelerations, I solve the matrix equation

$$
M\boldsymbol{\alpha}=\mathbf F.
$$

When \(M\) is invertible, this is equivalent to

$$
\boldsymbol{\alpha}=M^{-1}\mathbf F.
$$

Thus, at every timestep, the simulation calculates \(M\) and \(\mathbf F\) from the current angles and angular velocities and solves this system for \(\alpha_1\) and \(\alpha_2\).

---

## Numerical Methods

At each timestep, the system is evaluated using the current values of \(\theta_1,\theta_2,\omega_1,\) and \(\omega_2\). The matrix equation is solved for \(\alpha_1\) and \(\alpha_2\), which are then used to update the system.

### Semi-Implicit Euler

I initially used a semi-implicit Euler method:

1. Update the angular velocities using the computed accelerations.
2. Update the angles using the new angular velocities.

I chose Euler's method because it was the first and simplest numerical ODE solver I learned in my BC Calculus class. It only requires evaluating the current derivatives and updating the state variables at each timestep, making it straightforward to implement. Using the semi-implicit version improves stability because it updates the angles using the newly computed velocities rather than the old ones.

However, numerical error still accumulates over time because Euler's method approximates the true solution using only the local slope at each timestep. Since the actual trajectory is continuously changing, each step introduces truncation error. These errors propagate through later timesteps, causing quantities such as total energy to gradually drift away from their true values.

For this system, total mechanical energy should remain constant because gravity is conservative and the fixed pivot does no work.

The Euler implementation served as a baseline for understanding both the dynamics of the system and the limitations of first-order numerical integration.

### Runge–Kutta Methods

I next implemented second-order Runge–Kutta (RK2). This technique evaluates the slope at the beginning of an interval, uses it to estimate the midpoint of the interval, evaluates the slope at that midpoint, and uses the midpoint slope to calculate the change over the full interval.

With RK2, the total energy became much more stable and oscillated around a relatively fixed value. Euler's method has a global error of \(O(h)\), while RK2 has a global error of \(O(h^2)\), where \(h\) is the timestep.

I then implemented fourth-order Runge–Kutta (RK4), which evaluates the system at four points within each timestep. RK4 has a global error of \(O(h^4)\), providing substantially greater accuracy for the same timestep.

After implementing RK4, the total energy remained effectively constant over the duration of the simulation, indicating that the numerical energy error had become very small at the chosen timestep.

---

## Implementation

The simulation is coded using HTML5 and JavaScript. The screen is divided into three horizontal components: the simulation window, the control box, and three energy graphs in `index.html`. I used the Chart.js JavaScript library to render the energy plots.

The simulation uses:

* \(g=9.8\,\mathrm{m/s^2}\)
* \(dt=0.01\,\mathrm{s}\)
* 100 pixels = 1 meter

All angular calculations are performed in radians, so the initial angle inputs are converted from degrees. Lengths are measured in meters, time in seconds, and mass in kilograms.

The final simulation uses two physical masses, \(m_1\) and \(m_2\). I introduced the first mass after investigating a singularity in the original one-mass model. With both masses nonzero, the coefficient matrix remains invertible for all configurations.

I kept histories of the kinetic, potential, and total energies. The kinetic and potential energy graphs display the most recent values, while the total energy graph retains the history over the duration of the simulation.

To calculate the acceleration at each point, I used the matrix equation derived above. First, I calculated the entries of \(M\) using the current values of the angles. I then calculated \(X\) and \(Y\) using the current angles and angular velocities. Finally, I solved the resulting \(2\times2\) linear system for \(\alpha_1\) and \(\alpha_2\).

---

## User Manual

On the left of the screen is the simulation display, with the Cartesian coordinates displayed. The origin is chosen to be the equilibrium position of the pendulum.

In the middle, the user can control the initial conditions of the system, \(\theta_1\) and \(\theta_2\), from \(-180^\circ\) to \(180^\circ\), and set the lengths of each rod from 0.5 to 6 meters and the masses from 1 to 50 kilograms.

The **Play/Pause** button starts and stops the simulation and its associated graphs. The **Reset** button returns the pendulum to its initial state and erases the graphs. Angular velocities always begin at zero.

On the right, the graphs of kinetic, potential, and total energy are shown in joules. The kinetic and potential energy graphs show the most recent quantities, while the total energy graph shows the energy over the duration of the simulation.

---

## Results

For small initial angles, the simulation produced the expected oscillatory motion while approximately conserving total energy. As the initial angles increased, the trajectories became increasingly sensitive to the initial conditions, eventually displaying chaotic behavior.

The energy graphs also demonstrated the effects of different numerical integration methods. Euler's method produced noticeable energy drift, while RK2 reduced the drift and produced energy oscillations around a relatively stable value. RK4 reduced the numerical error further, resulting in a total energy graph that remained effectively flat over the duration of the simulation.

Because the physical system is conservative, total mechanical energy provides a useful diagnostic for measuring numerical error introduced by the integration method.

---

## Observations

I initially observed that whenever the rods became aligned, there was a large spike in the total energy, after which the two rods remained locked together. Since the derivation was carried out symbolically, this singular behavior was not immediately apparent. Only after substituting \(\theta_1=\theta_2\) into the determinant of the coefficient matrix did it become clear that the matrix becomes singular when the rods are collinear. At that instant, **M** is no longer invertible, so the matrix equation cannot be solved by computing \(M^{-1}\).

To determine whether the singularity was purely numerical, I modified the model by introducing a small mass at the intermediate hinge. This regularized the coefficient matrix, preventing its determinant from becoming exactly zero. However, because the determinant was still very small when the rods became aligned, the computed angular accelerations became extremely large, destabilizing the simulation without producing any runtime errors. Although this regularized the matrix numerically, it also changed the physical system being modeled, so it did not resolve the underlying issue.

This led to a more interesting question: does the singularity arise from the physical model itself, from the choice of generalized coordinates, or from the particular formulation of the equations of motion? Since the endpoint was the only body with inertia, the coefficient matrix became singular when the rods were collinear. I decided to investigate whether an alternative coordinate system or formulation of the equations could model the same one-mass pendulum while avoiding this numerical singularity.

### Update: July 2, 2026

When the determinant of \(M\) becomes zero, \(F\) also becomes zero, so I wondered if using a limit instead of direct substitution would be able to remove the singularity. I applied

$$
\theta_2=\theta_1+\epsilon
$$

and used the small-angle approximations

$$
\sin(\epsilon)\approx\epsilon
$$

and

$$
\cos(\epsilon)\approx1-\frac{\epsilon^2}{2}.
$$

However, taking the limit as \(\epsilon\) approaches zero did not remove the divergent behavior. My next step was to redo the calculations using new coordinates. Instead of \(\theta_2\), the absolute angle of the second rod, I used the relative angle between the rods,

$$
\phi=\theta_1-\theta_2.
$$

### Update: July 28, 2026

Upon redoing the calculations using the new coordinates, \(\theta\), the angle made by Rod 1 with the vertical, and \(\phi\), the relative angle between Rod 1 and Rod 2, the matrix still had a singularity, and the limit could not be taken either.

For the time being, instead of trying to find another way to resolve the singularity, I decided to use a pseudoinverse matrix to solve for the accelerations and return to the original coordinates, \(\theta_1\) and \(\theta_2\).

### Update: August 16, 2026

To explicitly find the pseudoinverse, I relied on a Singular Value Decomposition of the mass matrix \(M\). This process involves finding the eigenvalues and eigenvectors of \(M\), which is simplified by the fact that \(M\) is symmetrical.

The pseudoinverse reproduces the ordinary inverse when the matrix is invertible and replaces the problematic division by zero with zero when the matrix is singular. In the singular case, the original system does not have a unique solution, so the pseudoinverse provides the minimum-norm solution.

However, upon implementing the SVD and pseudoinverse, the simulation continued to break down when the rods became collinear. I also tried adding a tolerance window around the collinear configuration to avoid dividing by very small values, but this did not resolve the problem.

At this point, it seemed that the singularity could not be resolved while retaining the original one-mass physical model. My goal with this project was to explore numerical integration methods and their impact on stability. This tangential exploration was extremely interesting, but required analysis beyond my current mathematical scope.

In order to move forward, I elected to add a physical mass at the joint. This changes the physical system, but it makes the coefficient matrix invertible for every configuration.

### Update: September 6, 2026

With the new two-mass system, I rederived the equations of motion, which could be arranged into a new \(M\boldsymbol{\alpha}=\mathbf F\) matrix form.

The motion of the simulation appeared consistent with the expected physics, but the energy graphs revealed a new problem: total energy oscillated and, for some initial conditions, increased or decreased over time.

The only external force doing work on the system is gravity, which is conservative. The force exerted by the fixed pivot does no work because its point of application does not move. Therefore, total mechanical energy should remain constant, but the numerical integration method does not necessarily preserve this conservation law.

After researching numerical integration methods, I decided to implement Runge–Kutta methods to improve the accuracy and stability of the simulation.

### Update: September 27, 2026

First, I replaced Euler's method with Runge–Kutta 2. This technique evaluates the slope at the beginning of an interval, uses it to estimate the midpoint, evaluates the slope at the midpoint, and uses the new slope to calculate the total change over the interval.

After implementing RK2, the energy appeared to stabilize overall, oscillating around a relatively fixed value. Euler's method has a global error of \(O(h)\), while RK2 has a global error of \(O(h^2)\). Therefore, reducing the timestep decreases the expected global error more rapidly with RK2.

I then implemented RK4. RK4 evaluates the system at four points within each timestep and has a global error of \(O(h^4)\).

After implementing RK4, the total energy graph remained effectively flat over the duration of the simulation, which was the result I had been looking for.

This is the final stage of the program, and I have completed my exploration.

---

## Conclusion

While I initially set out to examine the differences in error accumulation between numerical integration techniques—Euler, RK2, and RK4—while applying the Euler–Lagrange equations to a double pendulum, a majority of the project was spent investigating the singularity that arose from the original one-mass system.

In doing so, I learned many of the challenges involved in modeling physical systems computationally and explored different techniques in linear algebra to make the system computationally tractable. Finally, I was able to compare different numerical integration methods and their effects on the stability of total mechanical energy.

If I were to continue the project, some possible directions would be:

* Trying to model the original one-mass system using Cartesian coordinates instead of angular coordinates
* Analyzing the differences between the integration techniques more quantitatively
* Investigating other numerical integration methods
* Comparing how chaotic behavior develops from different initial conditions
