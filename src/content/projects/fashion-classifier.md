---
title: Fashion Classifier
order: 1
year: 2026
category: Machine learning
summary: A neural network built from scratch. An exercise in understanding every step between a handful of pixels and a prediction.
contribution: I implemented the layers, gradients, training loop, and image preprocessing in Python and NumPy.
stack:
  - Python
  - NumPy
  - Fashion-MNIST
repository: https://github.com/onewaez/fashion-classifier
presentation: network
caption: The architecture, drawn out. Connections are schematic; layer sizes match the code.
---

## The question

What actually happens inside a neural network when it learns? I wanted to follow the whole path: from the pixels entering the model to the gradients updating its weights.

Fashion-MNIST gave me a focused problem: classify small grayscale images into ten clothing categories. I built a multilayer perceptron using NumPy so that the forward and backward passes stayed visible in the code.

## From pixels to probabilities

Each 28 × 28 image becomes a vector of **784 values**, normalized to the range [0, 1]. A fully connected layer maps those inputs to **128 hidden units**, followed by ReLU and a final layer with **10 outputs**.

The implementation includes He initialization, a numerically stable softmax, and cross-entropy loss. During backpropagation, each layer calculates its gradients and updates its weights using gradient descent.

```python
model = Sequential([
    Linear(784, 128),
    ReLU(),
    Linear(128, 10)
])
```

## What I built

- **Reusable layers.** Linear and ReLU each implement their own forward and backward passes.
- **A training loop.** The data is shuffled each epoch and processed in batches of 32. The current script runs for 25 epochs with a learning rate of 0.01.
- **Weight persistence.** Model parameters can be saved to a NumPy archive and loaded again for inference.
- **Image preprocessing.** The prediction script converts an image to grayscale, crops it to a square, resizes it, and normalizes its pixels before inference.

## What this experiment taught me

Writing the backward pass makes the chain rule concrete: each layer receives a gradient, computes its own parameter gradients, and passes a gradient to the layer before it. Keeping track of matrix shapes is as important as getting the equations right.

It also makes preprocessing part of the model's behaviour. A photograph prepared differently from the training images can produce an unreliable prediction, even when the code runs correctly.

## Limits & next questions

This is a learning project. The training script reports training loss; the repository does not currently include a held-out evaluation script. There is no verified test-accuracy result to report here.

The next useful steps are a reproducible train/validation/test evaluation, a confusion matrix, and checks of the analytical gradients against numerical estimates. The prediction script's softmax output should not be interpreted as calibrated confidence, especially for photographs outside the training distribution.

## Explore the implementation

The repository contains the source and a detailed walkthrough of the maths and data pipeline. To run it, you need Python, NumPy, Pillow, idx2numpy, and the Fashion-MNIST data files. The training script creates the weights used by the prediction script.

[Read the source and walkthrough on GitHub ↗](https://github.com/onewaez/fashion-classifier)
