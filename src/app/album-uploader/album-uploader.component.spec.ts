import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlbumUploaderComponent } from './album-uploader.component';

describe('AlbumUploaderComponent', () => {
  let component: AlbumUploaderComponent;
  let fixture: ComponentFixture<AlbumUploaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlbumUploaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AlbumUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
