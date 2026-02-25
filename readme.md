# 📝 Go Todo List - Modern Edition

Une application de liste de tâches (Todo List) performante et élégante, construite avec **Go** pour le backend et **MySQL** pour la persistance des données. Le design est inspiré d'une interface moderne avec des dégradés dynamiques et des animations fluides.

## ✨ Caractéristiques

* **Backend robuste** : Développé en Go (Golang) avec une gestion efficace des routes.
* **Design Moderne** : Interface utilisateur épurée avec un dégradé violet (`linear-gradient`) et des ombres portées.
* **Numérotation Dynamique** : Les tâches sont numérotées de manière séquentielle (#1, #2, #3...) indépendamment de leur ID en base de données.
* **Animations** : Entrée des tâches avec un effet `slideIn` et transitions au survol.
* **Persistance SQL** : Stockage fiable dans une base de données MySQL.

---

## 🚀 Installation et Lancement Local

### 1. Prérequis

* **Go** installé sur votre machine.
* **MySQL** opérationnel.

### 2. Configuration de la Base de Données

Connectez-vous à votre MySQL Shell et créez la structure nécessaire :

```sql
CREATE DATABASE todo_db;
USE todo_db;