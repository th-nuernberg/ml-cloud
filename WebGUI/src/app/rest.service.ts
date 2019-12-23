import {
    Injectable
} from '@angular/core';
import {
    HttpClient
} from '@angular/common/http';
import {
    Observable
} from 'rxjs';
import {
    HttpHeaders
} from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})

export class RestService {

    adress = 'http://localhost:5000';
    //adress: string = 'http://192.168.99.100:5000';
    username = 'mario';
    password = 'super';

    constructor(private http: HttpClient) {
    }

    setAuth(username: string, password: string) {
        this.username = username;
        this.password = password;
    }

    addJsonTypeHeaders(headers: HttpHeaders): HttpHeaders {
        return headers.append('Content-Type', 'application/json');
    }

    addAuthHeaders(headers: HttpHeaders): HttpHeaders {
        return headers.append('Authorization', 'Basic ' + btoa(this.username + ':' + this.password));
    }

    postDataset(datasetname: string): Observable<string[]> {
        const headers = this.addAuthHeaders(this.addJsonTypeHeaders(new HttpHeaders()));
        return this.http.post <string[]>(this.adress + '/datasets', {filename: datasetname}, {headers});
    }

    putDataset(datasetFile: File, datasetId: string): Observable<string[]> {
        const fd = new FormData();
        fd.append('file', datasetFile);

        const headers = this.addAuthHeaders(new HttpHeaders());

        return this.http.put <string[]>(this.adress + '/datasets/' + datasetId + '/bin/data', fd, {headers});
    }

    getDataset(datasetId: string): Observable<Blob> {
        const headers = this.addAuthHeaders(new HttpHeaders());

        return this.http.get <Blob>(this.adress + '/datasets/' + datasetId + '/bin/data', {headers, responseType: 'blob' as 'json'
        });
    }
    
    getEvalCsv(jobId: string): Observable<any> {
        const headers = this.addAuthHeaders(new HttpHeaders());

        return this.http.get <any>(this.adress + '/jobs/' + jobId + '/bin/generatedData', {headers, responseType: 'text' as 'json'});
    }

    deleteDataset(datasetId: string): Observable<string[]> {
        const headers = this.addAuthHeaders(new HttpHeaders());
        return this.http.delete <string[]>(this.adress + '/datasets/' + datasetId, {headers});
    }

    getAll(type: string): Observable<string[]> {
        const headers = this.addAuthHeaders(new HttpHeaders());
        return this.http.get <string[]>(this.adress + '/' + type + '/*', {headers});
    }

    getArch(architectureId: string): Observable<string[]> {
        const headers = this.addAuthHeaders(new HttpHeaders());
        return this.http.get <string[]>(this.adress + '/architectures/' + architectureId, {headers});
    }

    deleteType(type: string, id: string): Observable<string[]> {
        const headers = this.addAuthHeaders(new HttpHeaders());
        return this.http.delete <string[]>(this.adress + '/' + type + '/' + id, {headers});
    }

    getType(type: string, id: string): Observable<string[]> {
        const headers = this.addAuthHeaders(new HttpHeaders());
        return this.http.get <string[]>(this.adress + '/' + type + '/' + id, {headers});
    }

    postType(type: string, config: Object): Observable<string[]> {
        const headers = this.addAuthHeaders(this.addJsonTypeHeaders(new HttpHeaders()));
        return this.http.post <string[]>(this.adress + '/' + type, config, {headers});
    }

    putType(type: string, id: string, config: Object): Observable<string[]> {
        const headers = this.addAuthHeaders(new HttpHeaders());
        return this.http.put <string[]>(this.adress + '/' + type + '/' + id, config, {headers});
    }
    
    patchType(type: string, id: string, config: Object): Observable<string[]> {
        const headers = this.addAuthHeaders(new HttpHeaders());
        return this.http.patch <string[]>(this.adress + '/' + type + '/' + id, config, {headers});
    }

    startExperiment(id: string): Observable<string[]> {
        const headers = this.addAuthHeaders(new HttpHeaders());
        return this.http.put <string[]>(this.adress + '/experiments/' + id + '/exec/start', {}, {headers});
    }
    
    startJob(id: string): Observable<string[]> {
        const headers = this.addAuthHeaders(new HttpHeaders());
        return this.http.put <string[]>(this.adress + '/jobs/' + id + '/exec/start', {}, {headers});
    }
    
    getCompatibleViews(id: string): Observable<string[]> {
        const headers = this.addAuthHeaders(new HttpHeaders());
        return this.http.get <string[]>(this.adress + '/views/' + id + '/compatible_views', {headers});
    }
}
