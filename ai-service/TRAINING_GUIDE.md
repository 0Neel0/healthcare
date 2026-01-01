# How to Train Your Own Medical Imaging Model

This guide outlines the steps to train a custom Deep Learning model (e.g., for Pneumonia detection from X-Rays) to replace the generic Gemini API.

## Phase 1: Data Collection & Preparation
You cannot train a model without data. For medical imaging, you need labeled datasets.

### 1. Acquire Data
Download open-source medical datasets.
*   **ChestX-ray14 (NIH)**: 100,000+ frontal X-rays.
*   **CheXpert (Stanford)**: Large dataset for chest radiograph interpretation.
*   **RSNA Pneumonia Detection Challenge**: Good for bounding box tasks.
*   **Kaggle**: Search for "Brain Tumor MRI" or "Skin Cancer MNIST".

### 2. Organize Data
Structure your folders for the training script:
```
/dataset
    /train
        /normal
        /pneumonia
    /val
        /normal
        /pneumonia
```

## Phase 2: Python Environment Setup
You need a GPU-enabled environment.
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
pip install pandas numpy pillow scikit-learn matplotlib
```

## Phase 3: The Training Script (PyTorch Example)
Create a file named `train_model.py`. We will use **Transfer Learning** with a specific efficient model (ResNet18 or EfficientNet) because training from scratch requires millions of images.

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, models, transforms
from torch.utils.data import DataLoader
import os

# 1. Configuration
DATA_DIR = 'dataset'
BATCH_SIZE = 32
LEARNING_RATE = 0.001
EPOCHS = 10
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# 2. Data Augmentation & Loading
# Transforms help the model generalize by slightly altering images
data_transforms = {
    'train': transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(10),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ]),
    'val': transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ]),
}

image_datasets = {x: datasets.ImageFolder(os.path.join(DATA_DIR, x), data_transforms[x]) for x in ['train', 'val']}
dataloaders = {x: DataLoader(image_datasets[x], batch_size=BATCH_SIZE, shuffle=True) for x in ['train', 'val']}
dataset_sizes = {x: len(image_datasets[x]) for x in ['train', 'val']}
class_names = image_datasets['train'].classes

# 3. Model Setup (Transfer Learning)
# We download a pre-trained ResNet18 and replace the last layer
model = models.resnet18(pretrained=True)
num_ftrs = model.fc.in_features
# Change output layer to matching number of classes (e.g., 2: Normal vs Pneumonia)
model.fc = nn.Linear(num_ftrs, len(class_names)) 
model = model.to(DEVICE)

# 4. Loss and Optimizer
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)

# 5. Training Loop
def train_model():
    print(f"Training on {DEVICE}...")
    
    for epoch in range(EPOCHS):
        print(f'Epoch {epoch+1}/{EPOCHS}')
        print('-' * 10)

        for phase in ['train', 'val']:
            if phase == 'train':
                model.train()
            else:
                model.eval()

            running_loss = 0.0
            running_corrects = 0

            for inputs, labels in dataloaders[phase]:
                inputs = inputs.to(DEVICE)
                labels = labels.to(DEVICE)

                optimizer.zero_grad()

                with torch.set_grad_enabled(phase == 'train'):
                    outputs = model(inputs)
                    _, preds = torch.max(outputs, 1)
                    loss = criterion(outputs, labels)

                    if phase == 'train':
                        loss.backward()
                        optimizer.step()

                running_loss += loss.item() * inputs.size(0)
                running_corrects += torch.sum(preds == labels.data)

            epoch_loss = running_loss / dataset_sizes[phase]
            epoch_acc = running_corrects.double() / dataset_sizes[phase]

            print(f'{phase} Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f}')

    # 6. Save the Model
    torch.save(model.state_dict(), 'medical_resnet_model.pth')
    print("Model saved as medical_resnet_model.pth")

if __name__ == '__main__':
    train_model()
```

## Phase 4: Integration
Once you have `medical_resnet_model.pth`, you can load it in your HMS `image_analyzer.py` service.

1.  Place the `.pth` file in `c:\HMS\ai-service\app\models\`.
2.  Modify `image_analyzer.py` to load this model instead of calling Gemini.

```python
# Simplified Logic for Inference
model.load_state_dict(torch.load("medical_resnet_model.pth"))
model.eval()
prediction = model(image_tensor)
```

## Considerations for Production
*   **Evaluation Metrics**: Accuracy is not enough. For medical imaging, you must track **Recall (Sensitivity)**. You cannot afford to miss a disease (false negative), even if it means having more false positives.
*   **Explainability**: Doctors generally do not trust "black boxes". Use techniques like **Grad-CAM** to produce heatmaps showing *where* the model is looking (e.g., highlighting the lung opacity). Gemini gives text explanations; custom models give heatmaps.
