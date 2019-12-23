import threading
import queue


class WorkerQueue:
    waiting_worker_list = []
    ready_worker_queue = queue.Queue()

    waiting_list_lock = threading.Lock()

    def enqueu_worker(self, worker_id):
        self.waiting_list_lock.acquire()
        self.waiting_worker_list.append(worker_id)
        self.waiting_list_lock.release()

    def remove_worker_from_list(self, worker_id):
        self.waiting_list_lock.acquire()
        try:
            self.waiting_worker_list.remove(worker_id)
        except:
            pass
        self.waiting_list_lock.release()

    def _still_ready(self, worker_id):
        contains_value = False
        self.waiting_list_lock.acquire()
        try:
            contains_value = worker_id in self.waiting_worker_list
        except:
            pass
        self.waiting_list_lock.release()
        return contains_value

    def add_to_queue(self, worker_id):
        if not self._still_ready(worker_id):
            self.enqueu_worker(worker_id)
            print("-> Worker ready (ID=" + worker_id + ")")
            self.ready_worker_queue.put(worker_id)

    def remove_worker(self, worker_id):
        self.remove_worker_from_list(worker_id)

    def get_next_worker(self):
        while (True):
            worker_id = self.ready_worker_queue.get()
            print("<- Worker dispatched (ID=" + worker_id + ")")
            if self._still_ready(worker_id):
                self.remove_worker_from_list(worker_id)
                return worker_id
