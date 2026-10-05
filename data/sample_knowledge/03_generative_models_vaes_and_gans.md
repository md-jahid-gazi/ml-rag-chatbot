# Deep Generative Modeling: Autoencoders, VAEs, and GANs

## 1. Introduction to Generative Modeling
- **Supervised Learning**: Maps data $x$ to labels $y$ ($x \to y$). Tasks include classification, object detection, and semantic segmentation.
- **Unsupervised / Generative Modeling**: Models the true underlying probability distribution $p_{\text{data}}(x)$ from unlabeled training samples.
  - **Density Estimation**: Calculates the probability density $p(x)$ for an input sample (useful for outlier/anomaly detection and dataset debiasing).
  - **Sample Generation**: Generates novel samples $x_{\text{new}} \sim p_{\text{model}}(x)$.

## 2. Latent Variable Models & The Myth of the Cave
Observed data points often reflect high-dimensional reflections of lower-dimensional explanatory factors (latent variables $z$).
- Analogy: In Plato's Allegory of the Cave, prisoners observe projected shadows on the wall; latent variable modeling seeks to deduce the actual 3D objects and fire that produced those shadows from the observed projections.

## 3. Traditional Autoencoders (AEs)
- **Architecture**:
  - **Encoder**: Maps high-dimensional input $x$ to a low-dimensional bottleneck latent representation $z$.
  - **Decoder**: Maps latent vector $z$ back to a reconstructed observation $\hat{x}$.
- **Objective**: Minimizes reconstruction loss without labels:
  $$\mathcal{L}(x, \hat{x}) = \|x - \hat{x}\|^2$$
- **Bottleneck Principle**: Compressing data forces the network to preserve only the most salient explanatory features. However, traditional autoencoders lack a regularized continuous latent manifold, making random sampling for generation unreliable.

## 4. Variational Autoencoders (VAEs)
Variational Autoencoders introduce a probabilistic foundation to autoencoders:
- Rather than outputting a single deterministic point $z$, the encoder network estimates the parameters of a conditional Gaussian distribution:
  - Mean vector $\boldsymbol{\mu}(x)$
  - Standard deviation vector $\boldsymbol{\sigma}(x)$
- The latent vector is sampled from $q_\phi(z \mid x) = \mathcal{N}(\boldsymbol{\mu}, \boldsymbol{\sigma}^2 I)$.

### VAE Loss Function:
$$\mathcal{L}(\phi, \theta, x) = \underbrace{\|x - \hat{x}\|^2}_{\text{Reconstruction Loss}} + \underbrace{D_{\text{KL}}\big(q_\phi(z \mid x) \parallel p(z)\big)}_{\text{Regularization Term}}$$
where the prior distribution is chosen as standard normal $p(z) = \mathcal{N}(0, I)$.

- **Closed-Form KL Divergence**:
  $$D_{\text{KL}} = -\frac{1}{2} \sum_{j=0}^{k-1} \left(1 + \log(\sigma_j^2) - \mu_j^2 - \sigma_j^2\right)$$
  - Prevents the network from overfitting or clustering memorized points into isolated regions of space.

### The Reparameterization Trick:
- **Problem**: Gradient backpropagation cannot pass through a non-differentiable stochastic sampling node $z \sim q_\phi(z \mid x)$.
- **Solution**: Reformulate the stochastic variable as a deterministic function with an external noise input:
  $$z = \boldsymbol{\mu} + \boldsymbol{\sigma} \odot \boldsymbol{\epsilon}, \quad \text{where } \boldsymbol{\epsilon} \sim \mathcal{N}(0, I)$$
  This moves the stochastic operation outside the parameter update graph, allowing gradients $\frac{\partial \mathcal{L}}{\partial \boldsymbol{\mu}}$ and $\frac{\partial \mathcal{L}}{\partial \boldsymbol{\sigma}}$ to flow through the encoder network during backpropagation.

### Latent Perturbation & Disentanglement:
- Perturbing single latent dimensions while holding others constant reveals interpretable semantic attributes (e.g., azimuth, lighting, smile, head pose).
- Diagonal priors encourage latent dimensions to remain mutually uncorrelated and independent.

## 5. Generative Adversarial Networks (GANs)
GANs (Goodfellow et al., 2014) bypass explicit density estimation and directly learn to sample from complex data distributions through a two-player zero-sum game:
- **Generator ($G_{\theta_g}$)**: Takes random noise $z \sim p_z$ and generates synthetic samples $G(z)$ to fool the discriminator.
- **Discriminator ($D_{\theta_d}$)**: Evaluates real samples $x$ and synthetic samples $G(z)$, outputting probability $D(\cdot) \in [0, 1]$ that the input is real.

### Minimax Objective:
$$\min_G \max_D V(D, G) = \mathbb{E}_{x \sim p_{\text{data}}}[\log D(x)] + \mathbb{E}_{z \sim p_z}[\log(1 - D(G(z)))]$$
- The Discriminator maximizes classification accuracy: $D(x) \to 1$, $D(G(z)) \to 0$.
- The Generator minimizes the discriminator's detection accuracy: $D(G(z)) \to 1$.

### Breakthrough GAN Architectures:
1. **Progressive Growing of GANs (ProGAN, Karras et al., 2018)**:
   Progressively grows layers in both generator and discriminator starting from low resolution ($4\times 4$) up to high resolution ($1024\times 1024$), drastically stabilizing training.
2. **StyleGAN (Karras et al., 2018)**:
   Uses an adaptive instance normalization (AdaIN) style-based generator, separating coarse high-level styles (pose, facial structure) from fine-grained details (hair, micro-texture).
3. **CycleGAN (Zhu et al., 2017)**:
   Enables image-to-image domain translation using unpaired data via cycle consistency loss ($F(G(X)) \approx X$ and $G(F(Y)) \approx Y$), such as converting horses to zebras or summer scenes to winter scenes.
