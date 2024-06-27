terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "docker" {
  host = "unix:///var/run/docker.sock"
}

resource "docker_network" "take_home_network" {
  name = "take-home-network"
}

resource "docker_image" "take_home_app" {
  name = "ryam47/chat-app:0.0.1"
  keep_locally = false
}

resource "docker_container" "take_home_app" {
  name  = "chat-app"
  image = docker_image.take_home_app.name
  ports {
    internal = 3000
    external = 3000
  }
  env = [
    "RABBITMQ_URL=amqp://rabbitmq:5672",
    "PORT=3000",
  ]
  networks_advanced {
    name = docker_network.take_home_network.name
  }
  depends_on = [
    docker_container.rabbitmq
  ]
}

resource "docker_image" "rabbitmq" {
  name = "rabbitmq:latest"
  keep_locally = false
}

resource "docker_container" "rabbitmq" {
  name  = "rabbitmq"
  image = docker_image.rabbitmq.name
  ports {
    internal = 5672
    external = 5672
  }
  networks_advanced {
    name = docker_network.take_home_network.name
  }
}
