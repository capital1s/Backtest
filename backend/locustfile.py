# pylint: skip-file
from locust import HttpUser, TaskSet, between, task


class UserBehavior(TaskSet):
    @task
    def index(self):
        self.client.get("/")


class WebsiteUser(HttpUser):
    tasks = [UserBehavior]
    wait_time = between(1, 5)
