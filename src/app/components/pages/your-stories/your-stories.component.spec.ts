import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YourStoriesComponent } from './your-stories.component';

describe('YourStoriesComponent', () => {
  let component: YourStoriesComponent;
  let fixture: ComponentFixture<YourStoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YourStoriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YourStoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
